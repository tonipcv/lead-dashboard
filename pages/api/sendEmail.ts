import { NextApiRequest, NextApiResponse } from 'next';
import { sendEmail } from '../../src/lib/email';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Apenas aceita método POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { to, subject, text, html } = req.body;

    // Validação básica
    if (!to || !subject || (!text && !html)) {
      return res.status(400).json({ 
        error: 'Dados inválidos. Forneça destinatário (to), assunto (subject) e conteúdo (text ou html)' 
      });
    }

    console.log('Tentando enviar email para:', to);
    console.log('Usando credenciais:', {
      accessKeyId: process.env.SMTP_USER?.substring(0, 5) + '...',
      secretKey: process.env.SMTP_PASSWORD?.substring(0, 5) + '...'
    });

    // Enviar email
    const result = await sendEmail({ to, subject, text, html });

    if (result.success) {
      return res.status(200).json({ success: true, messageId: result.messageId });
    } else {
      console.error('Falha ao enviar email:', result.error);
      return res.status(500).json({ error: 'Falha ao enviar email', details: result.error });
    }
  } catch (error) {
    console.error('Erro no endpoint de envio de email:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}
