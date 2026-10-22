import { afterEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../src/app/createApp.jsx';
import { MemoryKVAdapter } from '../src/adapters/kv/memoryKv.js';

const VMESS_LINK = 'vmess://ew0KICAidiI6ICIyIiwNCiAgInBzIjogIkdyb3VwIE5vZGUiLA0KICAiYWRkIjogIjEuMS4xLjEiLA0KICAicG9ydCI6ICI0NDMiLA0KICAiaWQiOiAiYWRkNjY2NjYtODg4OC04ODg4LTg4ODgtODg4ODg4ODg4ODg4IiwNCiAgImFpZCI6ICIwIiwNCiAgInNjeSI6ICJhdXRvIiwNCiAgIm5ldCI6ICJ3cyIsDQogICJ0eXBlIjogIm5vbmUiLA0KICAiaG9zdCI6ICIiLA0KICAicGF0aCI6ICIvIiwNCiAgInRscyI6ICJ0bHMiDQp9';

function createGroupApp(kv = new MemoryKVAdapter()) {
    return {
        kv,
        app: createApp({
            kv,
            assetFetcher: null,
            logger: { log: vi.fn(), warn: vi.fn(), error: vi.fn() },
            config: {
                threeXuiBaseUrl: 'https://panel.example.test/app',
                threeXuiApiToken: 'test-token',
                threeXuiTimeoutMs: 100,
                threeXuiConcurrency: 2,
                threeXuiGroupCacheTtlSeconds: 60
            }
        })
    };
}

afterEach(() => vi.unstubAllGlobals());

describe('3x-ui group subscriptions', () => {
    it('builds Clash YAML and updates the group cache', async () => {
        const fetchMock = vi.fn()
            .mockResolvedValueOnce(Response.json({ success: true, msg: '', obj: ['alice'] }))
            .mockResolvedValueOnce(Response.json({ success: true, msg: '', obj: [VMESS_LINK, VMESS_LINK] }));
        vi.stubGlobal('fetch', fetchMock);
        const { app, kv } = createGroupApp();

        const response = await app.request('http://localhost/c/staff');

        expect(response.status).toBe(200);
        expect(response.headers.get('content-type')).toContain('text/yaml');
        expect(await response.text()).toContain('Group Node');
        const cached = await kv.get('staff');
        expect(cached).toContain('?config=');
        expect(new URLSearchParams(cached).get('config')).toBe(VMESS_LINK);
    });

    it('redirects to the cached Clash parameters when 3x-ui is unavailable', async () => {
        const kv = new MemoryKVAdapter();
        await kv.put('staff', `?config=${encodeURIComponent(VMESS_LINK)}`);
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('network unavailable')));
        const { app } = createGroupApp(kv);

        const response = await app.request('http://localhost/c/staff', { redirect: 'manual' });

        expect(response.status).toBe(302);
        expect(response.headers.get('location')).toContain('/clash?config=');
    });

    it('returns 404 when 3x-ui is unavailable and Redis has no matching key', async () => {
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('network unavailable')));
        const { app } = createGroupApp();

        const response = await app.request('http://localhost/c/missing', { redirect: 'manual' });

        expect(response.status).toBe(404);
    });

    it('falls back to a legacy short link when the group does not exist', async () => {
        const kv = new MemoryKVAdapter();
        await kv.put('legacy', `?config=${encodeURIComponent(VMESS_LINK)}`);
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
            Response.json({ success: true, msg: '', obj: [] })
        ));
        const { app } = createGroupApp(kv);

        const response = await app.request('http://localhost/c/legacy', { redirect: 'manual' });

        expect(response.status).toBe(302);
        expect(response.headers.get('location')).toContain('/clash?config=');
    });
});
