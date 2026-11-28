import { CLASH_RULE_MIRROR_BASE_URL } from './ruleUrls.js';

/**
 * Clash Configuration
 * Base configuration template for Clash client
 */

export const CLASH_CONFIG = {
	'mixed-port': 2333,
	'allow-lan': false,
	'tcp-concurrent': true,
	'mode': 'rule',
	'log-level': 'info',
	'geodata-mode': true,
	'geo-auto-update': true,
	'geodata-loader': 'standard',
	'geo-update-interval': 24,
	'sniffer': {
		'enable': true,
		'override-destination': true,
		'sniff': {
			'QUIC': {
				'ports': [443]
			},
			'TLS': {
				'ports': [443, 8443]
			},
			'HTTP': {
				'ports': [80, '8080-8880'],
				'override-destination': true
			}
		},
		'force-domain': [
			'+.netflix.com',
			'+.nflxvideo.net',
			'+.amazonaws.com',
			'+.media.dssott.com'
		],
		'skip-domain': [
			'+.apple.com',
			'dlg.io.mi.com',
			'+.oray.com',
			'+.sunlogin.net',
			'+.push.apple.com'
		],
		'parse-pure-ip': true,
		'force-dns-mapping': false
	},
	'geox-url': {
		'geoip': `${CLASH_RULE_MIRROR_BASE_URL}/MetaCubeX/meta-rules-dat/release/geoip.dat`,
		'geosite': `${CLASH_RULE_MIRROR_BASE_URL}/MetaCubeX/meta-rules-dat/release/geosite.dat`,
		'mmdb': `${CLASH_RULE_MIRROR_BASE_URL}/MetaCubeX/meta-rules-dat/release/country.mmdb`,
		'asn': `${CLASH_RULE_MIRROR_BASE_URL}/xishang0128/geoip/releases/download/latest/GeoLite2-ASN.mmdb`
	},
	'rule-providers': {
		// 将由代码自动生成
	},
	'dns': {
		'enable': true,
		'ipv6': false,
		'cache-algorithm': 'arc',
		'respect-rules': true,
		'enhanced-mode': 'fake-ip',
		'fake-ip-filter-mode': 'rule',
		'fake-ip-filter': [
			'RULE-SET,private,real-ip',
			'RULE-SET,fake-ip-real,real-ip',
			'MATCH,fake-ip'
		],
		// 1. Bootstrap DNS：用于解析 DoH 服务器本身的域名（必须是 IP 或能直接到达的）
		'default-nameserver': [
			'223.5.5.5',
			'119.29.29.29'
		],
		// 2. 默认使用国内 DoH；境外域名由 nameserver-policy 分流到境外 DoH
		'nameserver': [
			'https://223.5.5.5/dns-query',
			'https://120.53.53.53/dns-query'
		],
		// Prefer domestic DNS for domains shared by the CN and Microsoft rule sets.
		'nameserver-policy': {
			'rule-set:cn,private,apple': [
				'https://223.5.5.5/dns-query',
				'https://120.53.53.53/dns-query'
			],
			'rule-set:microsoft': [
				'https://cloudflare-dns.com/dns-query',
				'https://dns.google/dns-query'
			],
			'rule-set:geolocation-!cn': [
				'https://cloudflare-dns.com/dns-query',
				'https://dns.google/dns-query'
			]
		},
		// 专门用于解析代理节点域名，避免鸡蛋问题
		'proxy-server-nameserver': [
			'https://223.5.5.5/dns-query',
			'https://120.53.53.53/dns-query'
		],
		// 解析到最后发现是直连则走此 DNS
		'direct-nameserver': [
			'https://223.5.5.5/dns-query',
			'https://120.53.53.53/dns-query'
		],
		// Keep DIRECT resolution consistent with domain-specific DNS policies.
		'direct-nameserver-follow-policy': true

	},
		'proxies': [],
		'proxy-groups': []
	};
