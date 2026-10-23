import { CLASH_RULE_MIRROR_BASE_URL } from './ruleUrls.js';
const CUSTOM_RULES_REPO_BASE = 'https://raw.githubusercontent.com/leeechsh/meta-custom-rules-dat';
const CLASH_CUSTOM_RULES_REPO_BASE = `${CLASH_RULE_MIRROR_BASE_URL}/leeechsh/meta-custom-rules-dat`;

export const CUSTOM_REMOTE_SITE_RULE_SOURCES = {
    'custom-proxy': {
        singbox: `${CUSTOM_RULES_REPO_BASE}/sing/geosite/custom-proxy.srs`,
        clash: {
            mrs: `${CLASH_CUSTOM_RULES_REPO_BASE}/meta/geosite/custom-proxy.mrs`,
            yaml: `${CLASH_CUSTOM_RULES_REPO_BASE}/meta/geosite/custom-proxy.yaml`
        },
    },
    'custom-direct': {
        singbox: `${CUSTOM_RULES_REPO_BASE}/sing/geosite/custom-direct.srs`,
        clash: {
            mrs: `${CLASH_CUSTOM_RULES_REPO_BASE}/meta/geosite/custom-direct.mrs`,
            yaml: `${CLASH_CUSTOM_RULES_REPO_BASE}/meta/geosite/custom-direct.yaml`
        },
    }
};

export function getCustomSiteRuleSource(ruleName) {
    return CUSTOM_REMOTE_SITE_RULE_SOURCES[ruleName] || null;
}
