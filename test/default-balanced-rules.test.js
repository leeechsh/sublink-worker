import { describe, expect, it } from 'vitest';
import { DIRECT_DEFAULT_RULES, PREDEFINED_RULE_SETS, generateRules } from '../src/config/index.js';
import { parseSelectedRules } from '../src/app/createApp.jsx';
import { ClashConfigBuilder } from '../src/builders/ClashConfigBuilder.js';

const EXPECTED_DEFAULT_RULES = [
    'Private',
    'Custom Direct',
    'Custom Proxy',
    'AI Services',
    'Youtube',
    'Google',
    'Location:CN',
    'Telegram',
    'Github',
    'Microsoft',
    'Apple',
    'Social Media',
    'Streaming',
    'Non-China'
];

describe('default rule selection', () => {
    it('matches the requested default checkbox selection', () => {
        expect(new Set(PREDEFINED_RULE_SETS.balanced)).toEqual(new Set(EXPECTED_DEFAULT_RULES));
    });

    it('uses balanced rules when the request omits selectedRules', () => {
        expect(parseSelectedRules()).toEqual(PREDEFINED_RULE_SETS.balanced);
        expect(generateRules().map(rule => rule.outbound)).toEqual(
            generateRules('balanced').map(rule => rule.outbound)
        );
    });

    it('defaults Microsoft Services to DIRECT while keeping it selectable', async () => {
        expect(DIRECT_DEFAULT_RULES.has('Microsoft')).toBe(true);

        const input = 'ss://YWVzLTEyOC1nY206cGFzc3dvcmQ@example.com:443#Test';
        const builder = new ClashConfigBuilder(input, undefined, [], null, 'zh-CN', 'mihomo/1.19');
        await builder.build();
        const microsoft = builder.config['proxy-groups'].find(group => group.name === 'Ⓜ️ 微软服务');

        expect(microsoft.proxies[0]).toBe('DIRECT');
        expect(microsoft.proxies).toContain('🚀 节点选择');
    });

    it('enables Apple Services by default and defaults it to DIRECT', async () => {
        expect(PREDEFINED_RULE_SETS.balanced).toContain('Apple');
        expect(DIRECT_DEFAULT_RULES.has('Apple')).toBe(true);

        const input = 'ss://YWVzLTEyOC1nY206cGFzc3dvcmQ@example.com:443#Test';
        const builder = new ClashConfigBuilder(input, undefined, [], null, 'zh-CN', 'mihomo/1.19');
        await builder.build();
        const apple = builder.config['proxy-groups'].find(group => group.name === '🍏 苹果服务');

        expect(apple.proxies[0]).toBe('DIRECT');
        expect(apple.proxies).toContain('🚀 节点选择');
    });

    it('defaults unmatched traffic to DIRECT while keeping proxy choices', async () => {
        const input = 'ss://YWVzLTEyOC1nY206cGFzc3dvcmQ@example.com:443#Test';
        const builder = new ClashConfigBuilder(input, undefined, [], null, 'zh-CN', 'mihomo/1.19');
        await builder.build();
        const fallback = builder.config['proxy-groups'].find(group => group.name === '🐟 漏网之鱼');

        expect(fallback.proxies[0]).toBe('DIRECT');
        expect(fallback.proxies).toContain('🚀 节点选择');
        expect(fallback.proxies).toContain('REJECT');
    });
});
