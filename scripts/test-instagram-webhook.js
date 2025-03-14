const axios = require('axios');
require('dotenv').config();

// Configurações do Instagram
const VERIFY_TOKEN = process.env.INSTAGRAM_VERIFY_TOKEN || 'H34g+PDCOI2Vi2ilavlhEsHYCRSeF19bMLUhC0OZ8Rs=';
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'https://seu-dominio.com/api/instagram-webhook';

// Função para testar a verificação do webhook
async function testWebhookVerification() {
  console.log('🔄 Testando verificação do webhook do Instagram...');
  
  try {
    // Construir a URL de verificação
    const verificationUrl = `${WEBHOOK_URL}?hub.mode=subscribe&hub.verify_token=${encodeURIComponent(VERIFY_TOKEN)}&hub.challenge=CHALLENGE_ACCEPTED`;
    
    console.log(`🔹 Enviando solicitação para: ${verificationUrl}`);
    
    // Enviar solicitação GET para o webhook
    const response = await axios.get(verificationUrl);
    
    // Verificar a resposta
    if (response.status === 200 && response.data === 'CHALLENGE_ACCEPTED') {
      console.log('✅ Verificação do webhook bem-sucedida!');
      console.log('📋 Resposta:', response.data);
    } else {
      console.error('❌ Falha na verificação do webhook');
      console.error('📋 Resposta:', response.data);
    }
  } catch (error) {
    console.error('❌ Erro ao testar webhook:', error.response?.data || error);
  }
}

// Função para simular uma notificação do Instagram
async function simulateWebhookNotification() {
  console.log('🔄 Simulando notificação do webhook do Instagram...');
  
  try {
    // Criar um payload de exemplo para um comentário
    const payload = {
      object: 'instagram',
      entry: [
        {
          id: '123456789',
          time: Date.now(),
          changes: [
            {
              field: 'comments',
              value: {
                id: 'comment_id_123',
                text: 'Este é um comentário de teste!',
                media: {
                  id: 'media_id_456'
                },
                from: {
                  id: 'user_id_789',
                  username: 'usuario_teste'
                }
              }
            }
          ]
        }
      ]
    };
    
    console.log(`🔹 Enviando notificação para: ${WEBHOOK_URL}`);
    
    // Enviar solicitação POST para o webhook
    const response = await axios.post(WEBHOOK_URL, payload);
    
    // Verificar a resposta
    if (response.status === 200) {
      console.log('✅ Notificação enviada com sucesso!');
      console.log('📋 Resposta:', response.data);
    } else {
      console.error('❌ Falha ao enviar notificação');
      console.error('📋 Resposta:', response.data);
    }
  } catch (error) {
    console.error('❌ Erro ao simular notificação:', error.response?.data || error);
  }
}

// Executar os testes
async function runTests() {
  // Testar verificação do webhook
  await testWebhookVerification();
  
  console.log('\n-----------------------------------\n');
  
  // Simular notificação
  await simulateWebhookNotification();
}

runTests(); 