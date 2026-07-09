import { describe, it, expect } from 'vitest';
import { PREDEFINED_RULE_SETS, CUSTOM_RULES, generateRuleSets, generateClashRuleSets } from '../src/config/index.js';
import { ClashConfigBuilder } from '../src/builders/ClashConfigBuilder.js';

describe('custom remote rules', () => {
    it('removes built-in default custom rules from form bootstrap', () => {
        expect(CUSTOM_RULES).toEqual([]);
    });

    it('includes custom remote rules in predefined presets', () => {
        expect(PREDEFINED_RULE_SETS.minimal).toContain('Custom Proxy');
        expect(PREDEFINED_RULE_SETS.minimal).toContain('Custom Direct');
        expect(PREDEFINED_RULE_SETS.balanced).toContain('Custom Proxy');
        expect(PREDEFINED_RULE_SETS.balanced).toContain('Custom Direct');
    });

    it('uses custom sing-box remote ruleset URLs', () => {
        const { site_rule_sets } = generateRuleSets(['Custom Proxy', 'Custom Direct'], []);
        const customProxy = site_rule_sets.find(rule => rule.tag === 'custom-proxy');
        const customDirect = site_rule_sets.find(rule => rule.tag === 'custom-direct');

        expect(customProxy?.url).toBe('https://gh-proxy.org/https://github.com/leeechsh/meta-custom-rules-dat/raw/refs/heads/sing/geosite/custom-proxy.srs');
        expect(customDirect?.url).toBe('https://gh-proxy.org/https://github.com/leeechsh/meta-custom-rules-dat/raw/refs/heads/sing/geosite/custom-direct.srs');
    });

    it('uses custom clash remote provider URLs', () => {
        const mrsProviders = generateClashRuleSets(['Custom Proxy', 'Custom Direct'], [], true);
        expect(mrsProviders.site_rule_providers['custom-proxy']?.url).toBe('https://gh-proxy.org/https://github.com/leeechsh/meta-custom-rules-dat/raw/refs/heads/meta/geosite/custom-proxy.mrs');
        expect(mrsProviders.site_rule_providers['custom-direct']?.url).toBe('https://gh-proxy.org/https://github.com/leeechsh/meta-custom-rules-dat/raw/refs/heads/meta/geosite/custom-direct.mrs');

        const yamlProviders = generateClashRuleSets(['Custom Proxy', 'Custom Direct'], [], false);
        expect(yamlProviders.site_rule_providers['custom-proxy']?.url).toBe('https://gh-proxy.org/https://github.com/leeechsh/meta-custom-rules-dat/raw/refs/heads/meta/geosite/custom-proxy.yaml');
        expect(yamlProviders.site_rule_providers['custom-direct']?.url).toBe('https://gh-proxy.org/https://github.com/leeechsh/meta-custom-rules-dat/raw/refs/heads/meta/geosite/custom-direct.yaml');
    });

    it('keeps Custom Direct group as DIRECT only in clash output', async () => {
        const builder = new ClashConfigBuilder(
            'ss://YWVzLTEyOC1nY206dGVzdA@example.com:443#HK-Node-1',
            ['Custom Direct', 'Custom Proxy'],
            [],
            null,
            'zh-CN',
            'test-agent'
        );

        await builder.build();
        const customDirect = builder.config['proxy-groups'].find(group => group?.name === '🛡️ 自定义直连');

        expect(customDirect).toBeDefined();
        expect(customDirect.proxies).toEqual(['DIRECT']);
    });
});
