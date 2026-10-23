import { CLASH_RULE_MIRROR_BASE_URL } from './ruleUrls.js';

/**
 * Clash Configuration
 * Base configuration template for Clash client
 */

function buildRealIpRules(patterns) {
	const rules = patterns.flatMap(pattern => {
		if (typeof pattern !== 'string' || !pattern || /\s/.test(pattern)) return [];
		if (pattern.startsWith('+.') || pattern.startsWith('*.')) {
			return [`DOMAIN-SUFFIX,${pattern.slice(2)},real-ip`];
		}
		if (pattern.includes('*')) {
			return [`DOMAIN-WILDCARD,${pattern},real-ip`];
		}
		return [`DOMAIN,${pattern},real-ip`];
	});
	return [...new Set(rules)];
}

export const CLASH_CONFIG = {
	'port': 2333,
	'socks-port': 2334,
	'allow-lan': false,
	'mode': 'rule',
	'log-level': 'info',
	'geodata-mode': true,
	'geo-auto-update': true,
	'geodata-loader': 'standard',
	'geo-update-interval': 24,
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
			'RULE-SET,custom-direct,real-ip',
			...buildRealIpRules([
		    '*.lan',
		    '*.localdomain',
		    '*.example',
		    '*.invalid',
		    '*.localhost',
		    '*.test',
		    '*.local',
		    '*.home.arpa',
		    '*.direct',
		    'cable.auth.com',
		    'network-test.debian.org',
		    'detectportal.firefox.com',
		    'resolver1.opendns.com',
		    'global.turn.twilio.com',
		    'global.stun.twilio.com',
		    'app.yinxiang.com',
		    'injections.adguard.org',
		    'localhost.*.weixin.qq.com',
			'iosapps.itunes.apple.com',
			'iosapps.*.com',
		    '*.blzstatic.cn',
		    '*.cmpassport.com',
		    'id6.me',
		    'open.e.189.cn',
		    'opencloud.wostore.cn',
		    'id.mail.wo.cn',
		    'mdn.open.wo.cn',
		    'hmrz.wo.cn',
		    'nishub1.10010.com',
		    'enrichgw.10010.com',
		    '*.wosms.cn',
		    '*.jegotrip.com.cn',
		    '*.icitymobile.mobi',
		    '*.pingan.com.cn',
		    '*.cmbchina.com',
		    '*.10099.com.cn',
		    '*.microdone.cn',
		    'PDC._msDCS.*.*',
		    'DC._msDCS.*.*',
		    'GC._msDCS.*.*',
		    'time.*.com',
		    'time.*.gov',
		    'time.*.edu.cn',
		    'time.*.apple.com',
		    'time-ios.apple.com',
		    'time1.*.com',
		    'time2.*.com',
		    'time3.*.com',
		    'time4.*.com',
		    'time5.*.com',
		    'time6.*.com',
		    'time7.*.com',
		    'ntp.*.com',
		    'ntp1.*.com',
		    'ntp2.*.com',
		    'ntp3.*.com',
		    'ntp4.*.com',
		    'ntp5.*.com',
		    'ntp6.*.com',
		    'ntp7.*.com',
		    '*.time.edu.cn',
		    '*.ntp.org.cn',
		    '+.pool.ntp.org',
		    'time1.cloud.tencent.com',
		    'music.163.com',
		    '*.music.163.com',
		    '*.126.net',
		    'musicapi.taihe.com',
		    'music.taihe.com',
		    'songsearch.kugou.com',
		    'trackercdn.kugou.com',
		    '*.kuwo.cn',
		    'api-jooxtt.sanook.com',
		    'api.joox.com',
		    'joox.com',
		    'y.qq.com',
		    '*.y.qq.com',
		    'streamoc.music.tc.qq.com',
		    'mobileoc.music.tc.qq.com',
		    'isure.stream.qqmusic.qq.com',
		    'dl.stream.qqmusic.qq.com',
		    'aqqmusic.tc.qq.com',
		    'amobile.music.tc.qq.com',
		    '*.xiami.com',
		    '*.music.migu.cn',
		    'music.migu.cn',
		    '+.msftconnecttest.com',
		    '+.msftncsi.com',
		    'localhost.ptlogin2.qq.com',
		    'localhost.sec.qq.com',
		    '+.qq.com',
		    '+.tencent.com',
		    '+.srv.nintendo.net',
		    '*.n.n.srv.nintendo.net',
		    '+.cdn.nintendo.net',
		    '+.stun.playstation.net',
		    'xbox.*.*.microsoft.com',
		    '*.*.xboxlive.com',
		    'xbox.*.microsoft.com',
		    'xnotify.xboxlive.com',
		    '+.battle.net',
		    '+.battlenet.com.cn',
		    '+.wotgame.cn',
		    '+.wggames.cn',
		    '+.wowsgame.cn',
		    '+.wargaming.net',
		    'proxy.golang.org',
		    'stun.*.*',
		    'stun.*.*.*',
		    '+.stun.*.*',
		    '+.stun.*.*.*',
		    '+.stun.*.*.*.*',
		    '+.stun.*.*.*.*.*',
		    'heartbeat.belkin.com',
		    '*.linksys.com',
		    '*.linksyssmartwifi.com',
		    '*.router.asus.com',
		    'mesu.apple.com',
		    'swscan.apple.com',
		    'swquery.apple.com',
		    'swdownload.apple.com',
		    'swcdn.apple.com',
		    'swdist.apple.com',
		    'lens.l.google.com',
		    'stun.l.google.com',
		    'na.b.g-tun.com',
		    '+.nflxvideo.net',
		    '*.square-enix.com',
		    '*.finalfantasyxiv.com',
		    '*.ffxiv.com',
		    '*.ff14.sdo.com',
		    'ff.dorado.sdo.com',
		    '*.mcdn.bilivideo.cn',
		    '+.media.dssott.com',
		    'shark007.net',
		    'Mijia Cloud',
		    '+.cmbchina.com',
		    '+.cmbimg.com',
		    'local.adguard.org',
		    '+.sandai.net',
		    '+.n0808.com',
		    '+.uu.163.com',
		    'ps.res.netease.com',
		    '+.cslee.cc',
		    '+.metaiot.group',
			'+.leee.space',
			'+.imgcdn.cc.cd',
			'+.metaiot.cc.cd',
			'+.wujigg.com',
			'+.patronum.cc.cd',
			'+.dpdns.org',
		    '+.pub.3gppnetwork.org',
			]),
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
		//3. 明确国内域名、apple，走阿里/腾讯
		'nameserver-policy': {
			'geosite:cn,private,apple,microsoft': [
				'https://223.5.5.5/dns-query',
				'https://120.53.53.53/dns-query'
			],
			'geosite:geolocation-!cn': [
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
		// 直连出口固定使用 direct-nameserver，避免再次被境外 policy 改写
		'direct-nameserver-follow-policy': false

	},
		'proxies': [],
		'proxy-groups': []
	};
