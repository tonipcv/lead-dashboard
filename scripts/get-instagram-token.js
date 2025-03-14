const axios = require('axios');
require('dotenv').config();

// Configurações do Instagram
const INSTAGRAM_APP_ID = process.env.INSTAGRAM_APP_ID || '2576913712507077';
const INSTAGRAM_APP_SECRET = process.env.INSTAGRAM_APP_SECRET || '71df1811f8c5f77d30012c470e2bf46c';
const REDIRECT_URI = process.env.INSTAGRAM_REDIRECT_URI || 'https://seu-dominio.com/api/instagram/auth/callback';

// Código de autorização obtido após o usuário fazer login
// Este código é obtido na URL de redirecionamento após o login
const AUTH_CODE = process.argv[2];

if (!AUTH_CODE) {
  console.log(`
🔑 Como obter um token de acesso do Instagram:

1. Primeiro, obtenha um código de autorização acessando a seguinte URL no navegador:
   https://api.instagram.com/oauth/authorize
     ?client_id=${INSTAGRAM_APP_ID}
     &redirect_uri=${encodeURIComponent(REDIRECT_URI)}
     &scope=user_profile,user_media
     &response_type=code

2. Faça login com sua conta do Instagram e autorize o aplicativo.

3. Você será redirecionado para ${REDIRECT_URI}?code=CODIGO_DE_AUTORIZACAO

4. Copie o código de autorização da URL e execute este script novamente:
   node scripts/get-instagram-token.js CODIGO_DE_AUTORIZACAO
  `);
  process.exit(0);
}

async function getAccessToken() {
  try {
    console.log('🔄 Obtendo token de acesso do Instagram...');
    
    const response = await axios.post('https://api.instagram.com/oauth/access_token', {
      client_id: INSTAGRAM_APP_ID,
      client_secret: INSTAGRAM_APP_SECRET,
      grant_type: 'authorization_code',
      redirect_uri: REDIRECT_URI,
      code: AUTH_CODE
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    const { access_token, user_id } = response.data;
    
    console.log('✅ Token de acesso obtido com sucesso!');
    console.log('📋 Adicione o seguinte ao seu arquivo .env:');
    console.log(`INSTAGRAM_ACCESS_TOKEN=${access_token}`);
    console.log(`INSTAGRAM_USER_ID=${user_id}`);
    
    // Obter token de longa duração
    console.log('🔄 Obtendo token de longa duração...');
    
    const longLivedResponse = await axios.get('https://graph.instagram.com/access_token', {
      params: {
        grant_type: 'ig_exchange_token',
        client_secret: INSTAGRAM_APP_SECRET,
        access_token: access_token
      }
    });
    
    const { access_token: long_lived_token, expires_in } = longLivedResponse.data;
    
    console.log('✅ Token de longa duração obtido com sucesso!');
    console.log('📋 Adicione o seguinte ao seu arquivo .env:');
    console.log(`INSTAGRAM_LONG_LIVED_TOKEN=${long_lived_token}`);
    console.log(`Token expira em ${Math.floor(expires_in / 86400)} dias`);
    
  } catch (error) {
    console.error('❌ Erro ao obter token de acesso:', error.response?.data || error);
  }
}

getAccessToken(); 