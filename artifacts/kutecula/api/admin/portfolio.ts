import type { VercelRequest, VercelResponse } from '@vercel/node';

// Default portfolio items — used as fallback
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
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return false;
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    return decoded.startsWith('kutecula-admin:') && decoded.endsWith(`:${adminPassword.slice(0, 4)}`);
  } catch {
    return false;
  }
}

function getKvCredentials() {
  const url =
    process.env.KV_REST_API_URL ||
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.VERCEL_KV_REST_API_URL ||
    process.env.REDIS_REST_API_URL ||
    process.env.REST_API_URL;

  const token =
    process.env.KV_REST_API_TOKEN ||
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.VERCEL_KV_REST_API_TOKEN ||
    process.env.REDIS_REST_API_TOKEN ||
    process.env.REST_API_TOKEN;

  return { url, token };
}

async function getPortfolioFromKV() {
  const { url, token } = getKvCredentials();
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

    // 2. Pipeline GET
    const pipeRes = await fetch(`${baseUrl}/pipeline`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([['GET', 'kutecula_portfolio']]),
    });
    if (pipeRes.ok) {
      const pipeData = await pipeRes.json() as Array<{ result: any }>;
      if (Array.isArray(pipeData) && pipeData[0] && pipeData[0].result) {
        let parsed = typeof pipeData[0].result === 'string' ? JSON.parse(pipeData[0].result) : pipeData[0].result;
        if (typeof parsed === 'string') parsed = JSON.parse(parsed);
        if (Array.isArray(parsed)) return parsed;
      }
    }

    return null;
  } catch (err) {
    console.error('Error reading from KV:', err);
    return null;
  }
}

async function savePortfolioToKV(portfolio: unknown): Promise<{ success: boolean; error?: string }> {
  const { url, token } = getKvCredentials();

  if (!url || !token) {
    const envKeys = Object.keys(process.env).filter(
      (k) => !k.includes('PASS') && !k.includes('SECRET') && !k.includes('KEY') && !k.includes('TOKEN')
    );
    return {
      success: false,
      error: `Variáveis do Vercel KV não detetadas no servidor (Variáveis presentes: [${envKeys.join(', ')}]). Na Vercel, aceda a "Deployments", clique nos "..." do deploy mais recente e faça "Redeploy" para carregar o KV.`,
    };
  }

  const baseUrl = url.replace(/\/$/, '');
  const payloadString = JSON.stringify(portfolio);

  try {
    // 1. Upstash Pipeline endpoint
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

    // 2. Direct SET endpoint
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

    const errText = await setRes.text();
    return {
      success: false,
      error: `Vercel KV recusou o salvamento (HTTP ${setRes.status}): ${errText || setRes.statusText}`,
    };
  } catch (err: any) {
    return {
      success: false,
      error: `Erro ao comunicar com Vercel KV: ${err?.message || String(err)}`,
    };
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'OPTIONS') return res.status(200).end();

    if (req.method === 'GET') {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      const portfolio = await getPortfolioFromKV();
      return res.status(200).json({
        items: portfolio ?? DEFAULT_PORTFOLIO,
        source: portfolio ? 'kv' : 'default',
      });
    }

    if (req.method === 'POST') {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!verifyAdminToken(token)) {
        return res.status(401).json({ error: 'Não autorizado. Faça login como admin.' });
      }

      let body = req.body;
      if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch {}
      }
      const { items } = (body || {}) as { items?: unknown[] };
      if (!items || !Array.isArray(items)) {
        return res.status(400).json({ error: 'items deve ser um array' });
      }

      const result = await savePortfolioToKV(items);
      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error || 'Não foi possível guardar no Vercel KV.',
        });
      }
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Método não permitido' });
  } catch (err) {
    console.error('Unexpected error in admin portfolio API:', err);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
}
