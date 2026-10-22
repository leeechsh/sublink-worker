import { CloudflareKVAdapter } from '../adapters/kv/cloudflareKv.js';

export function createCloudflareRuntime(env) {
    return {
        kv: env?.SUBLINK_KV ? new CloudflareKVAdapter(env.SUBLINK_KV) : null,
        assetFetcher: env?.ASSETS ? (request) => env.ASSETS.fetch(request) : null,
        logger: console,
        config: {
            threeXuiBaseUrl: env?.THREE_X_UI_BASE_URL,
            threeXuiApiToken: env?.THREE_X_UI_API_TOKEN,
            threeXuiTimeoutMs: env?.THREE_X_UI_TIMEOUT_MS,
            threeXuiConcurrency: env?.THREE_X_UI_CONCURRENCY
        }
    };
}
