const SUPPORTED_SCHEMES = new Set([
    'ss:', 'vmess:', 'vless:', 'trojan:', 'hysteria:', 'hysteria2:', 'hy2:', 'tuic:', 'anytls:'
]);

export class ThreeXuiError extends Error {
    constructor(message, code, cause) {
        super(message, cause ? { cause } : undefined);
        this.name = 'ThreeXuiError';
        this.code = code;
    }
}

export function createThreeXuiService(options = {}) {
    const baseUrl = String(options.baseUrl || '').replace(/\/$/, '');
    const apiToken = String(options.apiToken || '').trim();
    const timeoutMs = positiveNumber(options.timeoutMs, 3000);
    const concurrency = positiveNumber(options.concurrency, 5);

    if (!baseUrl || !apiToken) return null;

    const requestJson = async (path) => {
        let response;
        try {
            response = await fetch(`${baseUrl}${path}`, {
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${apiToken}`
                },
                signal: AbortSignal.timeout(timeoutMs)
            });
        } catch (error) {
            throw new ThreeXuiError('3x-ui is unavailable', 'unavailable', error);
        }

        if (response.status === 401 || response.status === 403) {
            throw new ThreeXuiError(`3x-ui authentication failed (${response.status})`, 'authentication');
        }
        if (!response.ok) {
            const code = response.status >= 500 ? 'unavailable' : 'response';
            throw new ThreeXuiError(`3x-ui returned HTTP ${response.status}`, code);
        }

        try {
            return await response.json();
        } catch (error) {
            throw new ThreeXuiError('3x-ui returned invalid JSON', 'response', error);
        }
    };

    const fetchClientLinks = async (email) => {
        const payload = await requestJson(`/panel/api/clients/links/${encodeURIComponent(email)}`);
        if (payload?.success !== true || !Array.isArray(payload.obj)) {
            throw new ThreeXuiError(payload?.msg || 'Invalid 3x-ui links response', 'response');
        }
        return normalizeLinks(payload.obj);
    };

    const fetchGroupLinks = async (group) => {
        const payload = await requestJson(`/panel/api/clients/groups/${encodeURIComponent(group)}/emails`);
        if (payload?.success !== true || !Array.isArray(payload.obj)) {
            throw new ThreeXuiError(payload?.msg || 'Invalid 3x-ui group response', 'response');
        }

        const emails = [...new Set(payload.obj.filter(email => typeof email === 'string').map(email => email.trim()).filter(Boolean))];
        if (emails.length === 0) return { status: 'not_found', links: [], failedEmails: [] };

        const settled = await mapWithConcurrency(emails, concurrency, fetchClientLinks);
        const links = normalizeLinks(settled.flatMap(result => result.status === 'fulfilled' ? result.value : []));
        const failedEmails = settled.flatMap((result, index) => result.status === 'rejected' ? [emails[index]] : []);

        if (failedEmails.length === emails.length) {
            const firstError = settled.find(result => result.status === 'rejected')?.reason;
            throw firstError instanceof ThreeXuiError
                ? firstError
                : new ThreeXuiError('All 3x-ui client link requests failed', 'unavailable', firstError);
        }

        return { status: 'found', links, failedEmails };
    };

    return { fetchGroupLinks };
}

export function normalizeLinks(values) {
    return [...new Set(values
        .filter(value => typeof value === 'string')
        .map(value => value.trim())
        .filter(Boolean)
        .filter(value => {
            try {
                return SUPPORTED_SCHEMES.has(new URL(value).protocol);
            } catch {
                return false;
            }
        }))];
}

async function mapWithConcurrency(values, limit, mapper) {
    const results = new Array(values.length);
    let nextIndex = 0;

    const worker = async () => {
        while (nextIndex < values.length) {
            const index = nextIndex++;
            try {
                results[index] = { status: 'fulfilled', value: await mapper(values[index]) };
            } catch (reason) {
                results[index] = { status: 'rejected', reason };
            }
        }
    };

    await Promise.all(Array.from({ length: Math.min(limit, values.length) }, worker));
    return results;
}

function positiveNumber(value, fallback) {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}
