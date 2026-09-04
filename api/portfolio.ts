import type { VercelRequest, VercelResponse } from '@vercel/node';

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

function verifyAdminToken(token: string | undefined): boolean {
  if (!token) return false;
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    return decoded.startsWith('kutecula-admin:');
  } catch {
    return false;
  }
}

function getRedisCredentials() {
  // 1. Standard known prefixes (KV, STORAGE, REDIS, UPSTASH)
  let url =
    process.env.KV_REST_API_URL ||
    process.env.STORAGE_REST_API_URL ||
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.VERCEL_KV_REST_API_URL ||
    process.env.REDIS_REST_API_URL ||
    process.env.REST_API_URL;

  let token =
    process.env.KV_REST_API_TOKEN ||
    process.env.STORAGE_REST_API_TOKEN ||
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.VERCEL_KV_REST_API_TOKEN ||
    process.env.REDIS_REST_API_TOKEN ||
    process.env.REST_API_TOKEN;

  // 2. Dynamic discovery: Any variable ending with _REST_API_URL
  if (!url || !token) {
    for (const key of Object.keys(process.env)) {
      if (key.endsWith('_REST_API_URL')) {
        const prefix = key.slice(0, -'_REST_API_URL'.length);
        const candidateTokenKey = `${prefix}_REST_API_TOKEN`;
        if (process.env[key] && process.env[candidateTokenKey]) {
          url = process.env[key];
          token = process.env[candidateTokenKey];
          break;
        }
      }
    }
  }

  // 3. Fallback: Parse redis:// or rediss:// connection string (REDIS_URL, KV_URL, STORAGE_URL, etc.)
  if (!url || !token) {
    const redisUrlStr =
      process.env.REDIS_URL ||
      process.env.KV_URL ||
      process.env.STORAGE_URL ||
      process.env.UPSTASH_REDIS_URL;
    if (redisUrlStr) {
      try {
        const parsed = new URL(redisUrlStr);
        if (parsed.hostname && parsed.password) {
          url = `https://${parsed.hostname}`;
          token = parsed.password;
        }
      } catch (e) {
        console.error('Error parsing REDIS_URL/KV_URL:', e);
      }
    }
  }

  return { url, token };
}

async function getPortfolioFromRedis(): Promise<any[] | null> {
  const { url, token } = getRedisCredentials();
  if (!url || !token) return null;

  const baseUrl = url.replace(/\/$/, '');

  try {
    // 1. Direct GET
    const res = await fetch(`${baseUrl}/get/kutecula_portfolio`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json() as { result: any };
      if (data && data.result !== null && data.result !== undefined) {
        let parsed = typeof data.result === 'string' ? JSON.parse(data.result) : data.result;
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && 'value' in parsed) {
          parsed = typeof parsed.value === 'string' ? JSON.parse(parsed.value) : parsed.value;
        }
        if (typeof parsed === 'string') parsed = JSON.parse(parsed);
        if (Array.isArray(parsed)) return parsed;
      }
    }

    // 2. Upstash Command endpoint
    const cmdRes = await fetch(`${baseUrl}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(['GET', 'kutecula_portfolio']),
    });
    if (cmdRes.ok) {
      const cmdData = await cmdRes.json() as { result: any };
      if (cmdData && cmdData.result !== null && cmdData.result !== undefined) {
        let parsed = typeof cmdData.result === 'string' ? JSON.parse(cmdData.result) : cmdData.result;
        if (typeof parsed === 'string') parsed = JSON.parse(parsed);
        if (Array.isArray(parsed)) return parsed;
      }
    }

    return null;
  } catch (err) {
    console.error('Error reading from Redis:', err);
    return null;
  }
}

async function savePortfolioToRedis(portfolio: unknown): Promise<{ success: boolean; error?: string }> {
  const { url, token } = getRedisCredentials();

  if (!url || !token) {
    return {
      success: false,
      error: 'Variáveis de conexão ao Redis (KV_REST_API_URL / KV_REST_API_TOKEN ou UPSTASH_REDIS_REST_URL) não encontradas no servidor Vercel. Crie a base de dados no painel da Vercel (Storage → KV / Redis).',
    };
  }

  const baseUrl = url.replace(/\/$/, '');
  const payloadString = JSON.stringify(portfolio);

  try {
    // 1. Upstash Command endpoint: POST ["SET", "kutecula_portfolio", payload]
    const cmdRes = await fetch(`${baseUrl}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(['SET', 'kutecula_portfolio', payloadString]),
    });
    if (cmdRes.ok) {
      return { success: true };
    }

    // 2. Upstash Pipeline endpoint
    const pipelineRes = await fetch(`${baseUrl}/pipeline`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([['SET', 'kutecula_portfolio', payloadString]]),
    });
    if (pipelineRes.ok) {
      return { success: true };
    }

    // 3. Direct SET endpoint
    const setRes = await fetch(`${baseUrl}/set/kutecula_portfolio`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payloadString),
    });
    if (setRes.ok) {
      return { success: true };
    }

    const errText = await cmdRes.text();
    return {
      success: false,
      error: `Redis recusou a gravação (HTTP ${cmdRes.status}): ${errText || cmdRes.statusText}`,
    };
  } catch (err: any) {
    return {
      success: false,
      error: `Erro ao comunicar com Redis: ${err?.message || String(err)}`,
    };
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      return res.status(200).end();
    }

    // GET /api/portfolio — Chamado pelo Site público e pelo Admin para ler do Redis
    if (req.method === 'GET') {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      const portfolio = await getPortfolioFromRedis();
      return res.status(200).json({
        items: portfolio ?? DEFAULT_PORTFOLIO,
        source: portfolio ? 'redis' : 'default',
      });
    }

    // POST /api/portfolio — Chamado pelo Admin para gravar no Redis
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

      // Sanitize Google Drive links e YouTube links antes de gravar no Redis
      const sanitized = items.map((it: any) => {
        if (!it || typeof it !== 'object') return it;
        const copy = { ...it };
        if (copy.type === 'image' && typeof copy.src === 'string') {
          const driveMatch = copy.src.match(/(?:drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=view&)?id=)|lh3\.googleusercontent\.com\/d\/)([\w-]+)/i);
          if (driveMatch && driveMatch[1]) {
            copy.src = `https://lh3.googleusercontent.com/d/${driveMatch[1]}`;
          }
        } else if (copy.type === 'video' && typeof copy.videoId === 'string') {
          const match = copy.videoId.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?(?:.*&)?v=|shorts\/))([\w-]{11})/i);
          if (match && match[1]) {
            copy.videoId = match[1];
          }
        }
        return copy;
      });

      const result = await savePortfolioToRedis(sanitized);

      if (!result.success) {
        return res.status(503).json({
          success: false,
          error: result.error,
        });
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
