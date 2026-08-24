import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

const RECIPIENTS = ['clique@kutecula.com', 'marsil@kutecula.com'];
const FROM_EMAIL = 'noreply@kutecula.com';
const FROM_NAME = 'Kutecula Visuals — Website';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

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

    const { name, email, message } = (body || {}) as {
      name?: string;
      email?: string;
      message?: string;
    };

    // Validation
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Campos obrigatórios em falta: name, email, message' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Email inválido' });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('RESEND_API_KEY não configurada');
      return res.status(500).json({ error: 'Configuração de email em falta no servidor' });
    }

    const resend = new Resend(apiKey);

    const { error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: RECIPIENTS,
      replyTo: `${name} <${email}>`,
      subject: `Nova mensagem do website — ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #111; color: #fff; padding: 32px; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #7B2D8E; margin: 0; font-size: 24px; letter-spacing: 2px;">KUTECULA VISUALS</h1>
            <p style="color: #666; margin: 8px 0 0; font-size: 12px; letter-spacing: 4px; text-transform: uppercase;">Nova mensagem do website</p>
          </div>

          <div style="background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 6px; padding: 24px; margin-bottom: 20px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; color: #666; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; width: 100px;">Nome</td>
                <td style="padding: 10px 0; color: #fff; font-weight: bold;">${escapeHtml(name)}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #666; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; border-top: 1px solid #2a2a2a;">Email</td>
                <td style="padding: 10px 0; color: #7B2D8E; border-top: 1px solid #2a2a2a;">
                  <a href="mailto:${escapeHtml(email)}" style="color: #7B2D8E; text-decoration: none;">${escapeHtml(email)}</a>
                </td>
              </tr>
            </table>
          </div>

          <div style="background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 6px; padding: 24px;">
            <p style="color: #666; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 12px;">Mensagem</p>
            <p style="color: #e0e0e0; line-height: 1.7; margin: 0; white-space: pre-wrap;">${escapeHtml(message)}</p>
          </div>

          <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #2a2a2a;">
            <p style="color: #444; font-size: 11px; margin: 0;">Pode responder directamente a este email para contactar ${escapeHtml(name)}</p>
            <p style="color: #7B2D8E; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; margin: 8px 0 0;">A Voz da Criatividade</p>
          </div>
        </div>
      `,
      text: `
Nova mensagem do website Kutecula Visuals
==========================================

Nome: ${name}
Email: ${email}

Mensagem:
${message}

--
Pode responder directamente a este email para contactar ${name}.
      `.trim(),
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ error: 'Falha ao enviar email. Tente novamente.' });
    }

    return res.status(200).json({ success: true, message: 'Mensagem enviada com sucesso!' });
  } catch (err) {
    console.error('Unexpected error in contact API:', err);
    return res.status(500).json({ error: 'Erro interno no servidor. Tente novamente mais tarde.' });
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
