import { describe, expect, it } from 'vitest';
import { SITE_RULE_SETS, IP_RULE_SETS, CLASH_SITE_RULE_SETS, CLASH_IP_RULE_SETS } from '../src/config/rules.js';

describe('rules config generation', () => {
	it('generates known site and ip rule sets', () => {
		expect(SITE_RULE_SETS.google).toBe('google.srs');
		expect(IP_RULE_SETS.google).toBe('google.srs');
		expect(CLASH_SITE_RULE_SETS.google).toBe('google.mrs');
		expect(CLASH_IP_RULE_SETS.google).toBe('google.mrs');
	});

	it('skips rules without site_rules or ip_rules arrays', () => {
		expect(SITE_RULE_SETS).not.toHaveProperty('undefined');
		expect(IP_RULE_SETS).not.toHaveProperty('undefined');
		expect(CLASH_SITE_RULE_SETS).not.toHaveProperty('undefined');
		expect(CLASH_IP_RULE_SETS).not.toHaveProperty('undefined');
	});
});
