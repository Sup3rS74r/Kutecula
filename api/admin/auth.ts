import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'OPTIONS') return res.status(200).end();

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Método não permitido' });
    }

    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        // ignore parse error
      }
    }

    const { password } = (body || {}) as { password?: string };

    if (!password) {
      return res.status(400).json({ error: 'Password em falta' });
    }

    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      return res.status(500).json({ error: 'ADMIN_PASSWORD não configurada no servidor' });
    }

    if (password !== adminPassword) {
      await new Promise((r) => setTimeout(r, 500));
      return res.status(401).json({ error: 'Password incorrecta' });
    }

    const token = Buffer.from(`kutecula-admin:${Date.now()}:${adminPassword.slice(0, 4)}`).toString('base64');
    return res.status(200).json({ success: true, token });
  } catch (err) {
    console.error('Unexpected error in admin auth API:', err);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
}
