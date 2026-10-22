import { describe, expect, it } from 'vitest';
import { CLASH_CONFIG } from '../src/config/clashConfig.js';
import { generateClashRuleSets, generateRules } from '../src/config/ruleGenerators.js';
import { emitClashRules } from '../src/builders/helpers/clashConfigUtils.js';

const translate = key => key.replace('outboundNames.', '');

describe('Clash DNS and routing defaults', () => {
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

    it('uses direct GitHub rule provider URLs', () => {
        const providers = generateClashRuleSets('minimal').site_rule_providers;

        expect(providers.private.url).toMatch(/^https:\/\/raw\.githubusercontent\.com\//);
        expect(Object.values(providers).every(provider => !provider.url.includes('gh-proxy'))).toBe(true);
    });

    it('always includes providers referenced by fake IP rules', () => {
        const providers = generateClashRuleSets(['Non-China']).site_rule_providers;

        expect(providers).toHaveProperty('private');
        expect(providers).toHaveProperty('custom-direct');
    });
});
