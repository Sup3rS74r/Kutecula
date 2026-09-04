import type { VercelRequest, VercelResponse } from '@vercel/node';

function verifyAdminToken(token: string | undefined): boolean {
  if (!token) return false;
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    return decoded.startsWith('kutecula-admin:');
  } catch {
    return false;
  }
}

function deriveRestCredentials(): { url: string | null; token: string | null; source: string } {
  // 1. Direct REST API env vars
  const directUrl =
    process.env.KV_REST_API_URL ||
    process.env.STORAGE_REST_API_URL ||
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.VERCEL_KV_REST_API_URL ||
    process.env.REDIS_REST_API_URL ||
    process.env.REST_API_URL;

  const directToken =
    process.env.KV_REST_API_TOKEN ||
    process.env.STORAGE_REST_API_TOKEN ||
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.VERCEL_KV_REST_API_TOKEN ||
    process.env.REDIS_REST_API_TOKEN ||
    process.env.REST_API_TOKEN;

  if (directUrl && directToken) {
    return { url: directUrl, token: directToken, source: 'direct env vars' };
  }

  // 2. Dynamic: _REST_API_URL + _REST_API_TOKEN
  for (const key of Object.keys(process.env)) {
    if (key.endsWith('_REST_API_URL')) {
      const prefix = key.slice(0, -'_REST_API_URL'.length);
      const tokenKey = `${prefix}_REST_API_TOKEN`;
      if (process.env[key] && process.env[tokenKey]) {
        return { url: process.env[key]!, token: process.env[tokenKey]!, source: `${key} + ${tokenKey}` };
      }
    }
  }

  // 3. Dynamic: broad _URL + _TOKEN
  for (const key of Object.keys(process.env)) {
    if (key.endsWith('_URL') && (key.includes('REDIS') || key.includes('KV') || key.includes('UPSTASH') || key.includes('STORAGE'))) {
      const prefix = key.slice(0, -'_URL'.length);
      const tokenKey = `${prefix}_TOKEN`;
      if (process.env[key] && process.env[tokenKey]) {
        return { url: process.env[key]!, token: process.env[tokenKey]!, source: `${key} + ${tokenKey}` };
      }
    }
  }

  // 4. Parse redis:// connection string
  const redisUrlStr =
    process.env.REDIS_URL ||
    process.env.KV_URL ||
    process.env.STORAGE_URL ||
    process.env.UPSTASH_REDIS_URL;

  if (redisUrlStr) {
    try {
      const parsed = new URL(redisUrlStr);
      if (parsed.hostname && parsed.password) {
        const restUrl = `https://${parsed.hostname}`;
        const restToken = decodeURIComponent(parsed.password);
        return { url: restUrl, token: restToken, source: `parsed from ${redisUrlStr.split(':')[0]}:// URL` };
      }
    } catch (e: any) {
      return { url: null, token: null, source: `Failed to parse redis URL: ${e?.message}` };
    }
  }

  return { url: null, token: null, source: 'no credentials found' };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const authHeader = req.headers.authorization || '';
  const adminToken = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!verifyAdminToken(adminToken)) {
    return res.status(401).json({ error: 'Não autorizado' });
  }

  const { url, token, source } = deriveRestCredentials();

  // Show all relevant env vars (masking token values)
  const relevantEnvKeys: Record<string, string> = {};
  for (const key of Object.keys(process.env)) {
    if (key.includes('URL') || key.includes('TOKEN') || key.includes('REDIS') || key.includes('KV') || key.includes('UPSTASH') || key.includes('STORAGE')) {
      const val = process.env[key] || '';
      const isSensitive = key.includes('TOKEN') || key.includes('SECRET') || key.includes('PASS');
      relevantEnvKeys[key] = isSensitive ? (val ? `✓ SET (${val.length} chars)` : '✗ NOT SET') : val.slice(0, 60) + (val.length > 60 ? '...' : '');
    }
  }

  const derived = {
    source,
    url: url ? url.slice(0, 60) + '...' : null,
    tokenPresent: !!token,
    tokenLength: token?.length ?? 0,
  };

  // Ping tests
  const tests: any[] = [];

  if (url && token) {
    const baseUrl = url.replace(/\/$/, '');

    // Test 1: PING command
    try {
      const r = await fetch(`${baseUrl}/ping`, { headers: { Authorization: `Bearer ${token}` } });
      const body = await r.text();
      tests.push({ test: 'GET /ping', status: r.status, ok: r.ok, body: body.slice(0, 100) });
    } catch (e: any) { tests.push({ test: 'GET /ping', error: e?.message }); }

    // Test 2: Upstash command endpoint (POST ['PING'])
    try {
      const r = await fetch(`${baseUrl}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(['PING']),
      });
      const body = await r.text();
      tests.push({ test: 'POST / [PING]', status: r.status, ok: r.ok, body: body.slice(0, 100) });
    } catch (e: any) { tests.push({ test: 'POST / [PING]', error: e?.message }); }

    // Test 3: Pipeline SET test
    try {
      const r = await fetch(`${baseUrl}/pipeline`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify([['SET', 'kutecula_debug_test', '"ok"']]),
      });
      const body = await r.text();
      tests.push({ test: 'POST /pipeline SET', status: r.status, ok: r.ok, body: body.slice(0, 100) });
    } catch (e: any) { tests.push({ test: 'POST /pipeline SET', error: e?.message }); }

  } else {
    tests.push({ test: 'skipped', reason: 'No URL or token derived' });
  }

  return res.status(200).json({
    env: relevantEnvKeys,
    derived,
    tests,
    nodeVersion: process.version,
  });
}
