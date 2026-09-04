import type { VercelRequest, VercelResponse } from '@vercel/node';
import Redis from 'ioredis';

// Default portfolio items — used only when Redis is empty or newly created
const DEFAULT_PORTFOLIO = [
  // Casamentos
  { id: 1,  type: 'image', src: '/portfolio-wedding-1.jpg',     label: { pt: 'Casamentos',  en: 'Weddings'    }, category: 'casamentos' },
  { id: 2,  type: 'image', src: '/portfolio-wedding-2.jpg',     label: { pt: 'Casamentos',  en: 'Weddings'    }, category: 'casamentos' },
  { id: 3,  type: 'image', src: '/portfolio-wedding-3.jpg',     label: { pt: 'Casamentos',  en: 'Weddings'    }, category: 'casamentos' },
  { id: 4,  type: 'image', src: '/portfolio-wedding-4.jpg',     label: { pt: 'Casamentos',  en: 'Weddings'    }, category: 'casamentos' },
  { id: 5,  type: 'video', videoId: 'Dm4lH7mvXfs',              label: { pt: 'Casamentos',  en: 'Weddings'    }, category: 'casamentos' },
  { id: 6,  type: 'video', videoId: 'hT_nvWreIhg',              label: { pt: 'Casamentos',  en: 'Weddings'    }, category: 'casamentos' },
  // Eventos
  { id: 7,  type: 'image', src: '/portfolio-corporate-1.jpg',   label: { pt: 'Eventos',     en: 'Events'      }, category: 'eventos' },
  { id: 8,  type: 'image', src: '/portfolio-events-1.jpg',      label: { pt: 'Eventos',     en: 'Events'      }, category: 'eventos' },
  { id: 9,  type: 'image', src: '/portfolio-events-2.jpg',      label: { pt: 'Eventos',     en: 'Events'      }, category: 'eventos' },
  { id: 10, type: 'video', videoId: 'JGwWNGJdvx8',              label: { pt: 'Eventos',     en: 'Events'      }, category: 'eventos' },
  { id: 11, type: 'video', videoId: 'CevxZvSJLk8',              label: { pt: 'Eventos',     en: 'Events'      }, category: 'eventos' },
  // Corporativo
  { id: 12, type: 'image', src: '/portfolio-corporate-2.jpg',   label: { pt: 'Corporativo', en: 'Corporate'   }, category: 'corporativo' },
  { id: 13, type: 'image', src: '/portfolio-corporate-3.jpg',   label: { pt: 'Corporativo', en: 'Corporate'   }, category: 'corporativo' },
  { id: 14, type: 'image', src: '/portfolio-corporate-4.jpg',   label: { pt: 'Corporativo', en: 'Corporate'   }, category: 'corporativo' },
  { id: 15, type: 'video', videoId: '9bZkp7q19f0',              label: { pt: 'Corporativo', en: 'Corporate'   }, category: 'corporativo' },
  { id: 16, type: 'video', videoId: 'kffacxfA7G4',              label: { pt: 'Corporativo', en: 'Corporate'   }, category: 'corporativo' },
  // Estúdio
  { id: 17, type: 'image', src: '/portfolio-studio-1.jpg',      label: { pt: 'Estúdio',     en: 'Studio'      }, category: 'estudio' },
  { id: 18, type: 'image', src: '/portfolio-studio-2.jpg',      label: { pt: 'Estúdio',     en: 'Studio'      }, category: 'estudio' },
  { id: 19, type: 'image', src: '/portfolio-studio-3.jpg',      label: { pt: 'Estúdio',     en: 'Studio'      }, category: 'estudio' },
  { id: 20, type: 'video', videoId: 'E7wJTI-1dvQ',              label: { pt: 'Estúdio',     en: 'Studio'      }, category: 'estudio' },
  { id: 21, type: 'video', videoId: '3JZ_D3ELwOQ',              label: { pt: 'Estúdio',     en: 'Studio'      }, category: 'estudio' },
  // Audiovisual
  { id: 22, type: 'image', src: '/portfolio-music-1.jpg',       label: { pt: 'Audiovisual', en: 'Audiovisual' }, category: 'audiovisual' },
  { id: 23, type: 'image', src: '/portfolio-music-2.jpg',       label: { pt: 'Audiovisual', en: 'Audiovisual' }, category: 'audiovisual' },
  { id: 24, type: 'image', src: '/portfolio-audiovisual-1.jpg', label: { pt: 'Audiovisual', en: 'Audiovisual' }, category: 'audiovisual' },
  { id: 25, type: 'video', videoId: 'RgKAFK5djSk',              label: { pt: 'Audiovisual', en: 'Audiovisual' }, category: 'audiovisual' },
  { id: 26, type: 'video', videoId: 'dQw4w9WgXcQ',              label: { pt: 'Audiovisual', en: 'Audiovisual' }, category: 'audiovisual' },
];

const REDIS_KEY = 'kutecula_portfolio';

// ─── Token verification ────────────────────────────────────────────────────────
function verifyAdminToken(token: string | undefined): boolean {
  if (!token) return false;
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    return decoded.startsWith('kutecula-admin:');
  } catch {
    return false;
  }
}

// ─── Get Redis URL ─────────────────────────────────────────────────────────────
function getRedisUrl(): string | null {
  return (
    process.env.REDIS_URL ||
    process.env.KV_URL ||
    process.env.STORAGE_URL ||
    process.env.UPSTASH_REDIS_URL ||
    null
  );
}

// ─── Create ioredis client ─────────────────────────────────────────────────────
function createRedisClient(): Redis | null {
  const url = getRedisUrl();
  if (!url) return null;
  try {
    const client = new Redis(url, {
      maxRetriesPerRequest: 2,
      connectTimeout: 8000,
      commandTimeout: 6000,
      enableReadyCheck: false,
      lazyConnect: true,
      tls: url.startsWith('rediss://') ? {} : undefined,
    });
    return client;
  } catch (err) {
    console.error('[Redis] Failed to create client:', err);
    return null;
  }
}

// ─── Try Upstash HTTP REST API (if credentials available) ─────────────────────
function getUpstashRestCredentials(): { url: string; token: string } | null {
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

  // Dynamic discovery: _REST_API_URL + _REST_API_TOKEN
  for (const key of Object.keys(process.env)) {
    if (key.endsWith('_REST_API_URL')) {
      const prefix = key.slice(0, -'_REST_API_URL'.length);
      const tokenKey = `${prefix}_REST_API_TOKEN`;
      if (process.env[key] && process.env[tokenKey]) {
        return { url: process.env[key]!, token: process.env[tokenKey]! };
      }
    }
  }

  return null;
}

// ─── Read from Redis ───────────────────────────────────────────────────────────
async function getPortfolioFromRedis(): Promise<any[] | null> {
  // 1. Try Upstash HTTP REST API
  const rest = getUpstashRestCredentials();
  if (rest) {
    try {
      const baseUrl = rest.url.replace(/\/$/, '');
      const res = await fetch(`${baseUrl}/get/${REDIS_KEY}`, {
        headers: { Authorization: `Bearer ${rest.token}` },
      });
      if (res.ok) {
        const data = await res.json() as { result: any };
        if (data?.result != null) {
          let parsed = typeof data.result === 'string' ? JSON.parse(data.result) : data.result;
          if (Array.isArray(parsed)) return parsed;
        }
      }
    } catch (err) {
      console.warn('[Redis GET] REST API failed, trying TCP:', err);
    }
  }

  // 2. Try ioredis TCP connection
  const client = createRedisClient();
  if (!client) return null;

  try {
    await client.connect();
    const raw = await client.get(REDIS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
    return null;
  } catch (err) {
    console.error('[Redis GET] TCP failed:', err);
    return null;
  } finally {
    try { client.disconnect(); } catch {}
  }
}

// ─── Write to Redis ────────────────────────────────────────────────────────────
async function savePortfolioToRedis(portfolio: unknown): Promise<{ success: boolean; error?: string }> {
  const payloadStr = JSON.stringify(portfolio);

  // 1. Try Upstash HTTP REST API
  const rest = getUpstashRestCredentials();
  if (rest) {
    try {
      const baseUrl = rest.url.replace(/\/$/, '');
      const res = await fetch(`${baseUrl}/pipeline`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${rest.token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify([['SET', REDIS_KEY, payloadStr]]),
      });
      if (res.ok) return { success: true };
    } catch (err) {
      console.warn('[Redis SET] REST API failed, trying TCP:', err);
    }
  }

  // 2. Try ioredis TCP connection
  const redisUrl = getRedisUrl();
  if (!redisUrl) {
    return {
      success: false,
      error: 'Variável REDIS_URL não encontrada. Adicione a ligação Redis no painel da Vercel (Settings → Environment Variables).',
    };
  }

  const client = createRedisClient();
  if (!client) {
    return { success: false, error: 'Não foi possível criar o cliente Redis a partir da REDIS_URL.' };
  }

  try {
    await client.connect();
    await client.set(REDIS_KEY, payloadStr);
    return { success: true };
  } catch (err: any) {
    console.error('[Redis SET] TCP failed:', err);
    return {
      success: false,
      error: `Erro na ligação TCP ao Redis: ${err?.message || String(err)}`,
    };
  } finally {
    try { client.disconnect(); } catch {}
  }
}

// ─── Sanitize portfolio items ──────────────────────────────────────────────────
function sanitizeItems(items: any[]): any[] {
  return items.map((it: any) => {
    if (!it || typeof it !== 'object') return it;
    const copy = { ...it };
    if (copy.type === 'image' && typeof copy.src === 'string') {
      const driveMatch = copy.src.match(/(?:drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=view&)?id=)|lh3\.googleusercontent\.com\/d\/)([\w-]+)/i);
      if (driveMatch?.[1]) {
        copy.src = `https://lh3.googleusercontent.com/d/${driveMatch[1]}`;
      }
    } else if (copy.type === 'video' && typeof copy.videoId === 'string') {
      const match = copy.videoId.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?(?:.*&)?v=|shorts\/))([\w-]{11})/i);
      if (match?.[1]) copy.videoId = match[1];
    }
    return copy;
  });
}

// ─── Handler ───────────────────────────────────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      return res.status(200).end();
    }

    // GET /api/portfolio — Read from Redis (public endpoint)
    if (req.method === 'GET') {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      const portfolio = await getPortfolioFromRedis();
      return res.status(200).json({
        items: portfolio ?? DEFAULT_PORTFOLIO,
        source: portfolio ? 'redis' : 'default',
      });
    }

    // POST /api/portfolio — Write to Redis (admin only)
    if (req.method === 'POST') {
      const authHeader = req.headers.authorization || '';
      const token = authHeader.replace(/^Bearer\s+/i, '').trim();
      if (!verifyAdminToken(token)) {
        return res.status(401).json({ success: false, error: 'Não autorizado. Token de administrador inválido.' });
      }

      let body = req.body;
      if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch {}
      }
      const { items } = (body || {}) as { items?: any[] };
      if (!items || !Array.isArray(items)) {
        return res.status(400).json({ success: false, error: 'O campo items deve ser um array.' });
      }

      const sanitized = sanitizeItems(items);
      const result = await savePortfolioToRedis(sanitized);

      if (!result.success) {
        return res.status(503).json({ success: false, error: result.error });
      }

      return res.status(200).json({
        success: true,
        message: 'Portfólio gravado com sucesso no Redis!',
        count: sanitized.length,
      });
    }

    return res.status(405).json({ error: 'Método não permitido' });
  } catch (err: any) {
    console.error('Unexpected error in portfolio API:', err);
    return res.status(500).json({ success: false, error: 'Erro interno no servidor.' });
  }
}
