import { describe, expect, it } from 'vitest';
import { CLASH_CONFIG } from '../src/config/clashConfig.js';
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
        expect(dns['fake-ip-filter']).toContain('RULE-SET,private,real-ip');
        expect(dns['fake-ip-filter']).toContain('RULE-SET,custom-direct,real-ip');
        expect(dns['fake-ip-filter'].at(-1)).toBe('MATCH,fake-ip');
        expect(dns['nameserver-policy']['geosite:cn,private,apple,microsoft']).toHaveLength(2);
        expect(dns['nameserver-policy']['geosite:geolocation-!cn']).toHaveLength(2);
        expect(dns['proxy-server-nameserver']).toEqual([
            'https://223.5.5.5/dns-query',
            'https://120.53.53.53/dns-query'
        ]);
        expect(dns['direct-nameserver']).toEqual(dns['proxy-server-nameserver']);
        expect(dns['direct-nameserver-follow-policy']).toBe(false);
    });

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

    it('always includes providers referenced by fake IP rules', () => {
        const providers = generateClashRuleSets(['Non-China']).site_rule_providers;

        expect(providers).toHaveProperty('private');
        expect(providers).toHaveProperty('custom-direct');
    });
});
