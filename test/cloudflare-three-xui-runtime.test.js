import { describe, expect, it } from 'vitest';
import { createCloudflareRuntime } from '../src/runtime/cloudflare.js';
import { normalizeRuntime } from '../src/runtime/runtimeConfig.js';

describe('Cloudflare 3x-ui runtime', () => {
    it('maps dashboard variables and applies optional defaults', () => {
        const runtime = normalizeRuntime(createCloudflareRuntime({
            THREE_X_UI_BASE_URL: 'https://panel.example.test/app',
            THREE_X_UI_API_TOKEN: 'secret-token'
        }));

        expect(runtime.config).toMatchObject({
            threeXuiBaseUrl: 'https://panel.example.test/app',
            threeXuiApiToken: 'secret-token',
            threeXuiTimeoutMs: 3000,
            threeXuiConcurrency: 5
        });
    });
});
