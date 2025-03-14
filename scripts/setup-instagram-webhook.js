const axios = require('axios');
require('dotenv').config();

// Configurações do Instagram
const INSTAGRAM_APP_ID = process.env.INSTAGRAM_APP_ID || '2576913712507077';
const INSTAGRAM_APP_SECRET = process.env.INSTAGRAM_APP_SECRET || '71df1811f8c5f77d30012c470e2bf46c';
const VERIFY_TOKEN = process.env.INSTAGRAM_VERIFY_TOKEN || 'H34g+PDCOI2Vi2ilavlhEsHYCRSeF19bMLUhC0OZ8Rs=';
const ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;

// URL do seu webhook
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'https://seu-dominio.com/api/instagram-webhook';

// Campos para assinar
const FIELDS = [
  'comments',
  'mentions',
  'messages',
  'story_insights'
];

async function setupWebhook() {
  console.log('🔄 Configurando webhook do Instagram...');
  
  if (!ACCESS_TOKEN) {
    console.error('❌ Token de acesso não encontrado. Defina INSTAGRAM_ACCESS_TOKEN no arquivo .env');
    process.exit(1);
  }
  
  try {
    // 1. Configurar o webhook no App Dashboard
    console.log('🔹 Configurando webhook no App Dashboard...');
    const appResponse = await axios.post(
      `https://graph.facebook.com/v18.0/${INSTAGRAM_APP_ID}/subscriptions`,
      {
        object: 'instagram',
        callback_url: WEBHOOK_URL,
        fields: FIELDS.join(','),
        verify_token: VERIFY_TOKEN,
        access_token: `${INSTAGRAM_APP_ID}|${INSTAGRAM_APP_SECRET}`
      }
    );
    
    console.log('✅ Webhook configurado no App Dashboard:', appResponse.data);
    
    // 2. Assinar a conta do Instagram para receber notificações
    console.log('🔹 Assinando a conta do Instagram para receber notificações...');
    const subscribeResponse = await axios.post(
      `https://graph.instagram.com/v18.0/me/subscribed_apps`,
      {
        subscribed_fields: FIELDS.join(',')
      },
      {
        params: {
          access_token: ACCESS_TOKEN
        }
      }
    );
    
    console.log('✅ Conta do Instagram assinada com sucesso:', subscribeResponse.data);
    
    console.log('🎉 Configuração do webhook concluída com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao configurar webhook:', error.response?.data || error);
    process.exit(1);
  }
}

setupWebhook(); 