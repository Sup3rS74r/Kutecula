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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!verifyAdminToken(token)) {
    return res.status(401).json({ error: 'Não autorizado' });
  }

  // Collect all env vars (excluding sensitive values)
  const safe = (val: string | undefined) => val ? '✓ SET' : '✗ NOT SET';
  const val = (val: string | undefined) => val ? val.slice(0, 40) + '...' : 'NOT SET';

  const kvVars: Record<string, string> = {};
  for (const key of Object.keys(process.env)) {
    if (
      key.includes('URL') ||
      key.includes('TOKEN') ||
      key.includes('REDIS') ||
      key.includes('KV') ||
      key.includes('STORAGE') ||
      key.includes('UPSTASH')
    ) {
      // Show partial value for URLs, just ✓/✗ for tokens
      if (key.includes('TOKEN') || key.includes('SECRET') || key.includes('PASS')) {
        kvVars[key] = safe(process.env[key]);
      } else {
        kvVars[key] = val(process.env[key]);
      }
    }
  }

  // Try connecting to Redis
  const url =
    process.env.KV_REST_API_URL ||
    process.env.STORAGE_REST_API_URL ||
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.VERCEL_KV_REST_API_URL ||
    process.env.REDIS_REST_API_URL;

  const tkn =
    process.env.KV_REST_API_TOKEN ||
    process.env.STORAGE_REST_API_TOKEN ||
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.VERCEL_KV_REST_API_TOKEN ||
    process.env.REDIS_REST_API_TOKEN;

  let pingResult: any = { tested: false };
  if (url && tkn) {
    const baseUrl = url.replace(/\/$/, '');
    try {
      // Test with PING command
      const pingRes = await fetch(`${baseUrl}/ping`, {
        headers: { Authorization: `Bearer ${tkn}` },
      });
      const pingText = await pingRes.text();
      pingResult = {
        tested: true,
        status: pingRes.status,
        ok: pingRes.ok,
        response: pingText.slice(0, 200),
        urlUsed: baseUrl.slice(0, 50) + '...',
      };
    } catch (err: any) {
      pingResult = { tested: true, error: err?.message || String(err) };
    }
  }

  return res.status(200).json({
    env: kvVars,
    found: { url: !!url, token: !!tkn },
    ping: pingResult,
    nodeVersion: process.version,
  });
}
