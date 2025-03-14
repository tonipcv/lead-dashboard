const axios = require('axios');
require('dotenv').config();

// Tentativa de importar o Prisma
let prisma;
try {
  const { PrismaClient } = require('@prisma/client');
  prisma = new PrismaClient();
} catch (error) {
  console.log('⚠️ Não foi possível conectar ao Prisma:', error.message);
  prisma = null;
}

// Configurações do Instagram
const INSTAGRAM_APP_ID = process.env.INSTAGRAM_APP_ID || '2576913712507077';
const INSTAGRAM_APP_SECRET = process.env.INSTAGRAM_APP_SECRET || '71df1811f8c5f77d30012c470e2bf46c';
const VERIFY_TOKEN = process.env.INSTAGRAM_VERIFY_TOKEN || 'H34g+PDCOI2Vi2ilavlhEsHYCRSeF19bMLUhC0OZ8Rs=';
const ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'https://seu-dominio.com/api/instagram-webhook';

// Função para verificar o token de acesso
async function checkAccessToken() {
  console.log('🔄 Verificando token de acesso do Instagram...');
  
  if (!ACCESS_TOKEN) {
    console.error('❌ Token de acesso não encontrado. Defina INSTAGRAM_ACCESS_TOKEN no arquivo .env');
    return false;
  }
  
  try {
    // Verificar se o token é válido
    const response = await axios.get('https://graph.instagram.com/me', {
      params: {
        fields: 'id,username',
        access_token: ACCESS_TOKEN
      }
    });
    
    console.log('✅ Token de acesso válido!');
    console.log('📋 Informações do usuário:', response.data);
    
    // Verificar a configuração no banco de dados se o Prisma estiver disponível
    if (prisma) {
      try {
        const instagramConfig = await prisma.instagramConfig.findFirst();
        
        if (instagramConfig) {
          console.log('📋 Configuração no banco de dados:');
          console.log(`   Status: ${instagramConfig.status}`);
          console.log(`   Usuário: ${instagramConfig.username}`);
          console.log(`   Atualizado em: ${instagramConfig.updatedAt}`);
        } else {
          console.log('⚠️ Nenhuma configuração encontrada no banco de dados');
        }
      } catch (dbError) {
        console.log('⚠️ Erro ao acessar a tabela InstagramConfig:', dbError.message);
      }
    } else {
      console.log('⚠️ Prisma não está disponível para verificar a configuração no banco de dados');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao verificar token de acesso:', error.response?.data || error);
    return false;
  }
}

// Função para verificar a configuração do webhook
async function checkWebhookConfig() {
  console.log('🔄 Verificando configuração do webhook...');
  
  try {
    // Verificar as assinaturas do aplicativo
    const appResponse = await axios.get(
      `https://graph.facebook.com/v18.0/${INSTAGRAM_APP_ID}/subscriptions`,
      {
        params: {
          access_token: `${INSTAGRAM_APP_ID}|${INSTAGRAM_APP_SECRET}`
        }
      }
    );
    
    console.log('📋 Assinaturas do aplicativo:');
    console.log(JSON.stringify(appResponse.data, null, 2));
    
    // Verificar as assinaturas da conta do Instagram
    if (ACCESS_TOKEN) {
      try {
        const accountResponse = await axios.get(
          `https://graph.instagram.com/v18.0/me/subscribed_apps`,
          {
            params: {
              access_token: ACCESS_TOKEN
            }
          }
        );
        
        console.log('📋 Assinaturas da conta do Instagram:');
        console.log(JSON.stringify(accountResponse.data, null, 2));
      } catch (error) {
        console.error('❌ Erro ao verificar assinaturas da conta:', error.response?.data || error);
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao verificar configuração do webhook:', error.response?.data || error);
    return false;
  }
}

// Função para verificar os comentários recentes
async function checkRecentComments() {
  console.log('🔄 Verificando comentários recentes...');
  
  if (!ACCESS_TOKEN) {
    console.error('❌ Token de acesso não encontrado. Defina INSTAGRAM_ACCESS_TOKEN no arquivo .env');
    return false;
  }
  
  try {
    // Obter o ID do usuário
    const userResponse = await axios.get('https://graph.instagram.com/me', {
      params: {
        fields: 'id',
        access_token: ACCESS_TOKEN
      }
    });
    
    const userId = userResponse.data.id;
    
    // Obter mídias recentes
    const mediaResponse = await axios.get(`https://graph.instagram.com/v18.0/${userId}/media`, {
      params: {
        access_token: ACCESS_TOKEN
      }
    });
    
    if (mediaResponse.data.data && mediaResponse.data.data.length > 0) {
      const mediaId = mediaResponse.data.data[0].id;
      
      // Obter comentários da mídia
      const commentsResponse = await axios.get(`https://graph.instagram.com/v18.0/${mediaId}/comments`, {
        params: {
          access_token: ACCESS_TOKEN
        }
      });
      
      console.log('📋 Comentários recentes:');
      console.log(JSON.stringify(commentsResponse.data, null, 2));
    } else {
      console.log('⚠️ Nenhuma mídia encontrada');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao verificar comentários recentes:', error.response?.data || error);
    return false;
  }
}

// Função para verificar o banco de dados
async function checkDatabase() {
  console.log('🔄 Verificando dados no banco de dados...');
  
  if (!prisma) {
    console.log('⚠️ Prisma não está disponível para verificar o banco de dados');
    return false;
  }
  
  try {
    // Verificar comentários
    try {
      const comments = await prisma.instagramComment.findMany({
        take: 5,
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      console.log(`📋 Comentários no banco de dados: ${comments.length}`);
      if (comments.length > 0) {
        console.log(JSON.stringify(comments, null, 2));
      }
    } catch (error) {
      console.log('⚠️ Erro ao acessar a tabela InstagramComment:', error.message);
    }
    
    // Verificar mensagens
    try {
      const messages = await prisma.instagramMessage.findMany({
        take: 5,
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      console.log(`📋 Mensagens no banco de dados: ${messages.length}`);
      if (messages.length > 0) {
        console.log(JSON.stringify(messages, null, 2));
      }
    } catch (error) {
      console.log('⚠️ Erro ao acessar a tabela InstagramMessage:', error.message);
    }
    
    // Verificar menções
    try {
      const mentions = await prisma.instagramMention.findMany({
        take: 5,
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      console.log(`📋 Menções no banco de dados: ${mentions.length}`);
      if (mentions.length > 0) {
        console.log(JSON.stringify(mentions, null, 2));
      }
    } catch (error) {
      console.log('⚠️ Erro ao acessar a tabela InstagramMention:', error.message);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao verificar banco de dados:', error);
    return false;
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}

// Executar todas as verificações
async function checkAll() {
  console.log('🔍 Iniciando verificação da integração do Instagram...');
  console.log('---------------------------------------------------');
  
  // Verificar token de acesso
  await checkAccessToken();
  
  console.log('\n---------------------------------------------------\n');
  
  // Verificar configuração do webhook
  await checkWebhookConfig();
  
  console.log('\n---------------------------------------------------\n');
  
  // Verificar comentários recentes
  await checkRecentComments();
  
  console.log('\n---------------------------------------------------\n');
  
  // Verificar banco de dados
  await checkDatabase();
  
  console.log('\n---------------------------------------------------\n');
  console.log('✅ Verificação concluída!');
}

checkAll(); 