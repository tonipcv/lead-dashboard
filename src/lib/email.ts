import nodemailer from 'nodemailer';

// Criar transporter do Nodemailer usando SMTP direto com configuração específica para AWS SES
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'email-smtp.sa-east-1.amazonaws.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, // true para 465, false para outras portas
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  // Configurações específicas para AWS SES
  tls: {
    // Não falhar em certificados inválidos
    rejectUnauthorized: true,
    // Forçar TLSv1.2 para compatibilidade com AWS SES
    minVersion: 'TLSv1.2'
  }
});

// Verificar a conexão com o servidor SMTP
transporter.verify(function (error, success) {
  if (error) {
    console.error('Erro na verificação do servidor SMTP:', error);
  } else {
    console.log('Servidor SMTP está pronto para enviar mensagens');
  }
});

// Interface para o email
export interface EmailData {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
}

// Função para enviar email
export async function sendEmail({ to, subject, text, html }: EmailData) {
  try {
    // Preparar os dados do email
    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME || 'Korax Labs AI'}" <${process.env.SMTP_FROM_EMAIL || 'ai@koraxlabs.com'}>`,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      text,
      html,
      // Adicionar headers específicos para rastreamento
      headers: {
        'X-SES-MESSAGE-TAGS': 'service=lead-dashboard'
      }
    };

    // Log das opções de email (sem mostrar credenciais)
    console.log('Tentando enviar email para:', Array.isArray(to) ? to : [to]);
    console.log('Usando credenciais:', {
      accessKeyId: process.env.SMTP_USER?.substring(0, 5) + '...',
      secretKey: process.env.SMTP_PASSWORD?.substring(0, 5) + '...'
    });
    console.log('Tentando enviar email com as seguintes opções:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    });

    // Enviar o email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email enviado com sucesso:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    return { success: false, error };
  }
}
