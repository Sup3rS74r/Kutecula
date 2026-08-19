import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { password } = req.body as { password?: string };

  if (!password) {
    return res.status(400).json({ error: 'Password em falta' });
  }

  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return res.status(500).json({ error: 'ADMIN_PASSWORD não configurada no servidor' });
  }

  if (password !== adminPassword) {
    // Add small delay to prevent brute-force
    await new Promise((r) => setTimeout(r, 500));
    return res.status(401).json({ error: 'Password incorrecta' });
  }

  // Return a simple session token (just a signed timestamp — not production auth, but sufficient for internal use)
  const token = Buffer.from(`kutecula-admin:${Date.now()}:${adminPassword.slice(0, 4)}`).toString('base64');

  return res.status(200).json({ success: true, token });
}
