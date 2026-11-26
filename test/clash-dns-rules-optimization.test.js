import { describe, expect, it } from 'vitest';
import yaml from 'js-yaml';
import { CLASH_CONFIG } from '../src/config/clashConfig.js';
import { ClashConfigBuilder } from '../src/builders/ClashConfigBuilder.js';
import { generateClashRuleSets, generateRules } from '../src/config/ruleGenerators.js';
import { emitClashRules } from '../src/builders/helpers/clashConfigUtils.js';

const translate = key => key.replace('outboundNames.', '');

describe('Clash DNS and routing defaults', () => {
    it('uses the independent mirror for every GEO database', () => {
        expect(CLASH_CONFIG['geox-url']).toEqual({
            geoip: 'https://gh.ieee.dpdns.org/MetaCubeX/meta-rules-dat/release/geoip.dat',
            geosite: 'https://gh.ieee.dpdns.org/MetaCubeX/meta-rules-dat/release/geosite.dat',
            mmdb: 'https://gh.ieee.dpdns.org/MetaCubeX/meta-rules-dat/release/country.mmdb',
            asn: 'https://gh.ieee.dpdns.org/xishang0128/geoip/releases/download/latest/GeoLite2-ASN.mmdb'
        });
    });
    it('uses rule-based fake IP filtering and redundant DoH resolvers', () => {
        const dns = CLASH_CONFIG.dns;

        expect(dns['cache-algorithm']).toBe('arc');
        expect(dns['fake-ip-filter-mode']).toBe('rule');
        expect(dns['fake-ip-filter']).toEqual([
            'RULE-SET,private,real-ip',
            'RULE-SET,fake-ip-real,real-ip',
            'MATCH,fake-ip'
        ]);
        expect(Object.entries(dns['nameserver-policy'])).toEqual([
            ['rule-set:cn,private,apple', ['https://223.5.5.5/dns-query', 'https://120.53.53.53/dns-query']],
            ['rule-set:microsoft', ['https://cloudflare-dns.com/dns-query', 'https://dns.google/dns-query']],
            ['rule-set:geolocation-!cn', ['https://cloudflare-dns.com/dns-query', 'https://dns.google/dns-query']]
        ]);
        expect(dns['proxy-server-nameserver']).toEqual([
            'https://223.5.5.5/dns-query',
            'https://120.53.53.53/dns-query'
        ]);
        expect(dns['direct-nameserver']).toEqual(dns['proxy-server-nameserver']);
        expect(dns['direct-nameserver-follow-policy']).toBe(true);
    });

    it('enables Clash sniffer with the configured protocol and domain policies', () => {
        const { sniffer } = CLASH_CONFIG;

        expect(sniffer.enable).toBe(true);
        expect(sniffer['override-destination']).toBe(true);
        expect(sniffer.sniff.QUIC.ports).toEqual([443]);
        expect(sniffer.sniff.TLS.ports).toEqual([443, 8443]);
        expect(sniffer.sniff.HTTP.ports).toEqual([80, '8080-8880']);
        expect(sniffer.sniff.HTTP['override-destination']).toBe(true);
        expect(sniffer['force-domain']).toEqual([
            '+.netflix.com',
            '+.nflxvideo.net',
            '+.amazonaws.com',
            '+.media.dssott.com'
        ]);
        expect(sniffer['skip-domain']).toEqual([
            '+.apple.com',
            'dlg.io.mi.com',
            '+.oray.com',
            '+.sunlogin.net',
            '+.push.apple.com'
        ]);
        expect(sniffer['parse-pure-ip']).toBe(true);
        expect(sniffer['force-dns-mapping']).toBe(false);
    });

    it.each([['mihomo', 'mrs'], ['Clash/1.0', 'yaml']])(
        'emits a DNS-only classical provider for %s without changing the custom-direct format',
        async (userAgent, customDirectFormat) => {
            const builder = new ClashConfigBuilder('', 'balanced', [], null, 'zh-CN', userAgent);
            const config = yaml.load(await builder.build());
            const providers = config['rule-providers'];

            expect(config.dns['fake-ip-filter']).toContain('RULE-SET,fake-ip-real,real-ip');
            expect(providers['fake-ip-real']).toMatchObject({
                type: 'http',
                behavior: 'classical',
                format: 'yaml',
                url: 'https://gh.ieee.dpdns.org/leeechsh/meta-custom-rules-dat/meta/geosite/fake-ip-real.yaml'
            });
            expect(providers['custom-direct'].format).toBe(customDirectFormat);
            expect(config.rules.some(rule => rule.includes('fake-ip-real'))).toBe(false);
        }
    );

    it('puts private and custom direct rules before custom proxy rules', () => {
        const rules = emitClashRules(generateRules('minimal'), translate);

        expect(rules.slice(0, 4)).toEqual([
            'RULE-SET,private,Private',
            'RULE-SET,private-ip,Private,no-resolve',
            'RULE-SET,custom-direct,Custom Direct',
            'RULE-SET,custom-proxy,Custom Proxy'
        ]);
        expect(rules.indexOf('RULE-SET,private-ip,Private,no-resolve'))
            .toBeLessThan(rules.indexOf('RULE-SET,cn-ip,Location:CN,no-resolve'));
    });

    it('uses the independent Cloudflare rule mirror', () => {
        const providers = generateClashRuleSets('minimal').site_rule_providers;

        expect(providers.private.url).toBe('https://gh.ieee.dpdns.org/MetaCubeX/meta-rules-dat/meta/geo/geosite/private.mrs');
        const all = generateClashRuleSets('balanced');
        expect([...Object.values(all.site_rule_providers), ...Object.values(all.ip_rule_providers)]
            .every(provider => provider.url.startsWith('https://gh.ieee.dpdns.org/'))).toBe(true);
        expect(Object.values(providers).every(provider => !provider.url.includes('gh-proxy'))).toBe(true);
        const legacy = generateClashRuleSets('balanced', [], false);
        expect(legacy.site_rule_providers.private.url).toBe('https://gh.ieee.dpdns.org/MetaCubeX/meta-rules-dat/meta/geo/geosite/private.yaml');
        expect(legacy.ip_rule_providers['cn-ip'].url).toBe('https://gh.ieee.dpdns.org/MetaCubeX/meta-rules-dat/meta/geo/geoip/cn.yaml');
    });

    it('includes providers for default and overridden fake IP rules', () => {
        const providers = generateClashRuleSets(['Non-China']).site_rule_providers;

        expect(providers).toHaveProperty('private');
        expect(providers).toHaveProperty('custom-direct');
        expect(providers).toHaveProperty('fake-ip-real');
    });

    it('keeps DNS policy providers available without enabling their routing rules', async () => {
        const builder = new ClashConfigBuilder('', ['Github'], [], null, 'zh-CN', 'mihomo');
        const config = yaml.load(await builder.build());

        for (const name of ['microsoft', 'cn', 'private', 'apple', 'geolocation-!cn']) {
            expect(config['rule-providers'][name]).toMatchObject({ behavior: 'domain', format: 'mrs' });
            expect(config.rules.some(rule => rule.startsWith(`RULE-SET,${name},`))).toBe(false);
        }
    });
});
