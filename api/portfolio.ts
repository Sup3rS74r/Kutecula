import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createConnection, type Socket } from 'net';
import { connect as tlsConnect, type TLSSocket } from 'tls';

const REDIS_KEY = 'kutecula_portfolio';

const DEFAULT_PORTFOLIO = [
  { id: 1,  type: 'image', src: '/portfolio-wedding-1.jpg',     label: { pt: 'Casamentos',  en: 'Weddings'    }, category: 'casamentos' },
  { id: 2,  type: 'image', src: '/portfolio-wedding-2.jpg',     label: { pt: 'Casamentos',  en: 'Weddings'    }, category: 'casamentos' },
  { id: 3,  type: 'image', src: '/portfolio-wedding-3.jpg',     label: { pt: 'Casamentos',  en: 'Weddings'    }, category: 'casamentos' },
  { id: 4,  type: 'image', src: '/portfolio-wedding-4.jpg',     label: { pt: 'Casamentos',  en: 'Weddings'    }, category: 'casamentos' },
  { id: 5,  type: 'video', videoId: 'Dm4lH7mvXfs',              label: { pt: 'Casamentos',  en: 'Weddings'    }, category: 'casamentos' },
  { id: 6,  type: 'video', videoId: 'hT_nvWreIhg',              label: { pt: 'Casamentos',  en: 'Weddings'    }, category: 'casamentos' },
  { id: 7,  type: 'image', src: '/portfolio-corporate-1.jpg',   label: { pt: 'Eventos',     en: 'Events'      }, category: 'eventos' },
  { id: 8,  type: 'image', src: '/portfolio-events-1.jpg',      label: { pt: 'Eventos',     en: 'Events'      }, category: 'eventos' },
  { id: 9,  type: 'image', src: '/portfolio-events-2.jpg',      label: { pt: 'Eventos',     en: 'Events'      }, category: 'eventos' },
  { id: 10, type: 'video', videoId: 'JGwWNGJdvx8',              label: { pt: 'Eventos',     en: 'Events'      }, category: 'eventos' },
  { id: 11, type: 'video', videoId: 'CevxZvSJLk8',              label: { pt: 'Eventos',     en: 'Events'      }, category: 'eventos' },
  { id: 12, type: 'image', src: '/portfolio-corporate-2.jpg',   label: { pt: 'Corporativo', en: 'Corporate'   }, category: 'corporativo' },
  { id: 13, type: 'image', src: '/portfolio-corporate-3.jpg',   label: { pt: 'Corporativo', en: 'Corporate'   }, category: 'corporativo' },
  { id: 14, type: 'image', src: '/portfolio-corporate-4.jpg',   label: { pt: 'Corporativo', en: 'Corporate'   }, category: 'corporativo' },
  { id: 15, type: 'video', videoId: '9bZkp7q19f0',              label: { pt: 'Corporativo', en: 'Corporate'   }, category: 'corporativo' },
  { id: 16, type: 'video', videoId: 'kffacxfA7G4',              label: { pt: 'Corporativo', en: 'Corporate'   }, category: 'corporativo' },
  { id: 17, type: 'image', src: '/portfolio-studio-1.jpg',      label: { pt: 'Estúdio',     en: 'Studio'      }, category: 'estudio' },
  { id: 18, type: 'image', src: '/portfolio-studio-2.jpg',      label: { pt: 'Estúdio',     en: 'Studio'      }, category: 'estudio' },
  { id: 19, type: 'image', src: '/portfolio-studio-3.jpg',      label: { pt: 'Estúdio',     en: 'Studio'      }, category: 'estudio' },
  { id: 20, type: 'video', videoId: 'E7wJTI-1dvQ',              label: { pt: 'Estúdio',     en: 'Studio'      }, category: 'estudio' },
  { id: 21, type: 'video', videoId: '3JZ_D3ELwOQ',              label: { pt: 'Estúdio',     en: 'Studio'      }, category: 'estudio' },
  { id: 22, type: 'image', src: '/portfolio-music-1.jpg',       label: { pt: 'Audiovisual', en: 'Audiovisual' }, category: 'audiovisual' },
  { id: 23, type: 'image', src: '/portfolio-music-2.jpg',       label: { pt: 'Audiovisual', en: 'Audiovisual' }, category: 'audiovisual' },
  { id: 24, type: 'image', src: '/portfolio-audiovisual-1.jpg', label: { pt: 'Audiovisual', en: 'Audiovisual' }, category: 'audiovisual' },
  { id: 25, type: 'video', videoId: 'RgKAFK5djSk',              label: { pt: 'Audiovisual', en: 'Audiovisual' }, category: 'audiovisual' },
  { id: 26, type: 'video', videoId: 'dQw4w9WgXcQ',              label: { pt: 'Audiovisual', en: 'Audiovisual' }, category: 'audiovisual' },
];

// ─── Token verification ─────────────────────────────────────────────────────
function verifyAdminToken(token: string | undefined): boolean {
  if (!token) return false;
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    return decoded.startsWith('kutecula-admin:');
  } catch {
    return false;
  }
}

// ─── Parse REDIS_URL ────────────────────────────────────────────────────────
interface RedisConfig {
  host: string;
  port: number;
  password: string;
  tls: boolean;
}

function parseRedisUrl(): RedisConfig | null {
  const urlStr =
    process.env.REDIS_URL ||
    process.env.KV_URL ||
    process.env.STORAGE_URL ||
    process.env.UPSTASH_REDIS_URL;
  if (!urlStr) return null;
  try {
    const u = new URL(urlStr);
    return {
      host: u.hostname,
      port: parseInt(u.port || '6379', 10),
      password: decodeURIComponent(u.password),
      tls: urlStr.startsWith('rediss://'),
    };
  } catch {
    return null;
  }
}

// ─── Robust RESP protocol parser ────────────────────────────────────────────
// Handles streaming TCP data correctly (data may arrive in multiple chunks)
function redisCommand(config: RedisConfig, ...args: string[]): Promise<string | null> {
  return new Promise((resolve, reject) => {
    let done = false;
    const finish = (val: string | null | Error) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      try { sock.destroy(); } catch {}
      if (val instanceof Error) reject(val);
      else resolve(val);
    };

    const timer = setTimeout(() => finish(new Error('Redis TCP timeout after 8s')), 8000);

    // RESP encode command
    const encode = (...parts: string[]): Buffer => {
      let s = `*${parts.length}\r\n`;
      for (const p of parts) s += `$${Buffer.byteLength(p, 'utf8')}\r\n${p}\r\n`;
      return Buffer.from(s, 'utf8');
    };

    let sock: Socket | TLSSocket;
    let buf = Buffer.alloc(0);

    // Track how many responses we expect (AUTH counts as one)
    const hasAuth = Boolean(config.password);
    let responsesDone = 0;
    const totalResponses = hasAuth ? 2 : 1;

    // Streaming RESP state machine
    const tryParse = () => {
      let pos = 0;
      while (!done && pos < buf.length) {
        const crlfIdx = buf.indexOf('\r\n', pos);
        if (crlfIdx === -1) return; // Need more data

        const typeChar = String.fromCharCode(buf[pos]);
        const lineStr = buf.slice(pos + 1, crlfIdx).toString('utf8');

        if (typeChar === '+') {
          // Simple string: +OK
          pos = crlfIdx + 2;
          responsesDone++;
          if (responsesDone >= totalResponses) {
            finish('OK');
          }
          // else: AUTH OK, continue
        } else if (typeChar === '-') {
          // Error: -ERR message
          finish(new Error(lineStr));
          return;
        } else if (typeChar === ':') {
          // Integer: :1
          pos = crlfIdx + 2;
          responsesDone++;
          if (responsesDone >= totalResponses) finish(lineStr);
        } else if (typeChar === '$') {
          const bulkLen = parseInt(lineStr, 10);
          if (bulkLen === -1) {
            // Null bulk string
            pos = crlfIdx + 2;
            responsesDone++;
            if (responsesDone >= totalResponses) finish(null);
          } else {
            // Bulk string: $N\r\n<N bytes>\r\n
            const dataStart = crlfIdx + 2;
            const dataEnd = dataStart + bulkLen;
            if (buf.length < dataEnd + 2) return; // Wait for full data
            const value = buf.slice(dataStart, dataEnd).toString('utf8');
            pos = dataEnd + 2; // skip trailing \r\n
            responsesDone++;
            if (responsesDone >= totalResponses) {
              finish(value);
            }
          }
        } else {
          // Unknown type (e.g. '*' array), skip line
          pos = crlfIdx + 2;
        }
      }
      // Update buffer to unconsumed bytes
      if (pos > 0) buf = buf.slice(pos);
    };

    const onConnect = () => {
      try {
        if (hasAuth) sock.write(encode('AUTH', 'default', config.password));
        sock.write(encode(...args));
      } catch (e: any) {
        finish(new Error(`Write failed: ${e?.message}`));
      }
    };

    const onData = (chunk: Buffer) => {
      buf = Buffer.concat([buf, chunk]);
      tryParse();
    };

    if (config.tls) {
      sock = tlsConnect(
        { host: config.host, port: config.port, rejectUnauthorized: false },
        onConnect,
      );
    } else {
      sock = createConnection({ host: config.host, port: config.port }, onConnect);
    }

    sock.on('data', onData);
    sock.on('error', (e) => finish(e));
    sock.on('timeout', () => finish(new Error('Redis TCP connection timed out')));
    sock.setTimeout(8000);
  });
}

// ─── Upstash REST API (fallback if REST credentials exist) ──────────────────
function getUpstashRest(): { url: string; token: string } | null {
  const url =
    process.env.KV_REST_API_URL ||
    process.env.STORAGE_REST_API_URL ||
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.VERCEL_KV_REST_API_URL ||
    process.env.REDIS_REST_API_URL;
  const token =
    process.env.KV_REST_API_TOKEN ||
    process.env.STORAGE_REST_API_TOKEN ||
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.VERCEL_KV_REST_API_TOKEN ||
    process.env.REDIS_REST_API_TOKEN;
  if (url && token) return { url, token };
  for (const key of Object.keys(process.env)) {
    if (key.endsWith('_REST_API_URL')) {
      const prefix = key.slice(0, -'_REST_API_URL'.length);
      const tk = `${prefix}_REST_API_TOKEN`;
      if (process.env[key] && process.env[tk]) return { url: process.env[key]!, token: process.env[tk]! };
    }
  }
  return null;
}

// ─── Get portfolio ──────────────────────────────────────────────────────────
async function getPortfolio(): Promise<any[] | null> {
  // 1. Upstash HTTP REST (fast, if available)
  const rest = getUpstashRest();
  if (rest) {
    try {
      const r = await fetch(`${rest.url.replace(/\/$/, '')}/get/${REDIS_KEY}`, {
        headers: { Authorization: `Bearer ${rest.token}` },
      });
      if (r.ok) {
        const d = await r.json() as { result: any };
        if (d?.result != null) {
          const p = typeof d.result === 'string' ? JSON.parse(d.result) : d.result;
          if (Array.isArray(p)) return p;
        }
      }
    } catch { /* fall through to TCP */ }
  }

  // 2. TCP (robust streaming parser)
  const cfg = parseRedisUrl();
  if (!cfg) return null;
  try {
    const raw = await redisCommand(cfg, 'GET', REDIS_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      if (Array.isArray(p)) return p;
    }
    return null;
  } catch (err) {
    console.error('[Redis GET TCP]', err);
    return null;
  }
}

// ─── Save portfolio ─────────────────────────────────────────────────────────
async function savePortfolio(portfolio: unknown): Promise<{ success: boolean; error?: string }> {
  const payload = JSON.stringify(portfolio);

  // 1. Upstash REST
  const rest = getUpstashRest();
  if (rest) {
    try {
      const r = await fetch(`${rest.url.replace(/\/$/, '')}/pipeline`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${rest.token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify([['SET', REDIS_KEY, payload]]),
      });
      if (r.ok) return { success: true };
    } catch { /* fall through to TCP */ }
  }

  // 2. TCP
  const cfg = parseRedisUrl();
  if (!cfg) {
    return {
      success: false,
      error: 'REDIS_URL não encontrada nas variáveis de ambiente da Vercel.',
    };
  }
  try {
    await redisCommand(cfg, 'SET', REDIS_KEY, payload);
    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      error: `Erro TCP ao Redis (${cfg.host}:${cfg.port}): ${err?.message || String(err)}`,
    };
  }
}

// ─── Sanitize portfolio items ───────────────────────────────────────────────
function sanitizeItems(items: any[]): any[] {
  return items.map((it: any) => {
    if (!it || typeof it !== 'object') return it;
    const copy = { ...it };
    if (copy.type === 'image' && typeof copy.src === 'string') {
      const m = copy.src.match(/(?:drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=view&)?id=)|lh3\.googleusercontent\.com\/d\/)([\w-]+)/i);
      if (m?.[1]) copy.src = `https://lh3.googleusercontent.com/d/${m[1]}`;
    } else if (copy.type === 'video' && typeof copy.videoId === 'string') {
      const m = copy.videoId.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?(?:.*&)?v=|shorts\/))([\w-]{11})/i);
      if (m?.[1]) copy.videoId = m[1];
    }
    return copy;
  });
}

// ─── Handler ────────────────────────────────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      return res.status(200).end();
    }

    if (req.method === 'GET') {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      const portfolio = await getPortfolio();
      return res.status(200).json({
        items: portfolio ?? DEFAULT_PORTFOLIO,
        source: portfolio ? 'redis' : 'default',
      });
    }

    if (req.method === 'POST') {
      const authHeader = req.headers.authorization || '';
      const token = authHeader.replace(/^Bearer\s+/i, '').trim();
      if (!verifyAdminToken(token)) {
        return res.status(401).json({ success: false, error: 'Não autorizado.' });
      }
      let body = req.body;
      if (typeof body === 'string') { try { body = JSON.parse(body); } catch {} }
      const { items } = (body || {}) as { items?: any[] };
      if (!items || !Array.isArray(items)) {
        return res.status(400).json({ success: false, error: 'O campo items deve ser um array.' });
      }
      const sanitized = sanitizeItems(items);
      const result = await savePortfolio(sanitized);
      if (!result.success) return res.status(503).json({ success: false, error: result.error });
      return res.status(200).json({ success: true, message: 'Portfólio gravado no Redis!', count: sanitized.length });
    }

    return res.status(405).json({ error: 'Método não permitido' });
  } catch (err: any) {
    console.error('Unexpected error:', err);
    return res.status(500).json({ success: false, error: 'Erro interno.' });
  }
}
