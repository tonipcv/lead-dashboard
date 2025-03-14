import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { prisma } from "@/lib/prisma";

// Configurações do Instagram
const INSTAGRAM_APP_ID = process.env.INSTAGRAM_APP_ID || '2576913712507077';
const INSTAGRAM_APP_SECRET = process.env.INSTAGRAM_APP_SECRET || '71df1811f8c5f77d30012c470e2bf46c';
const REDIRECT_URI = process.env.INSTAGRAM_REDIRECT_URI || 'https://seu-dominio.com/api/instagram/auth/callback';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorReason = searchParams.get('error_reason');
  const errorDescription = searchParams.get('error_description');
  
  // Se houver erro, exibir mensagem
  if (error) {
    console.error(`❌ Erro na autenticação do Instagram: ${error}, ${errorReason}, ${errorDescription}`);
    return new NextResponse(`
      <html>
        <head>
          <title>Erro na Autenticação do Instagram</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
            .error { color: red; background: #ffeeee; padding: 10px; border-radius: 5px; }
          </style>
        </head>
        <body>
          <h1>Erro na Autenticação do Instagram</h1>
          <div class="error">
            <p><strong>Erro:</strong> ${error}</p>
            <p><strong>Motivo:</strong> ${errorReason}</p>
            <p><strong>Descrição:</strong> ${errorDescription}</p>
          </div>
          <p><a href="/">Voltar para a página inicial</a></p>
        </body>
      </html>
    `, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  }
  
  // Se não houver código, exibir mensagem de erro
  if (!code) {
    return new NextResponse(`
      <html>
        <head>
          <title>Erro na Autenticação do Instagram</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
            .error { color: red; background: #ffeeee; padding: 10px; border-radius: 5px; }
          </style>
        </head>
        <body>
          <h1>Erro na Autenticação do Instagram</h1>
          <div class="error">
            <p>Código de autorização não encontrado.</p>
          </div>
          <p><a href="/">Voltar para a página inicial</a></p>
        </body>
      </html>
    `, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  }
  
  try {
    // Trocar o código de autorização por um token de acesso
    const tokenResponse = await axios.post('https://api.instagram.com/oauth/access_token', 
      new URLSearchParams({
        client_id: INSTAGRAM_APP_ID,
        client_secret: INSTAGRAM_APP_SECRET,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI,
        code: code
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    
    const { access_token, user_id } = tokenResponse.data;
    
    // Obter token de longa duração
    const longLivedResponse = await axios.get('https://graph.instagram.com/access_token', {
      params: {
        grant_type: 'ig_exchange_token',
        client_secret: INSTAGRAM_APP_SECRET,
        access_token: access_token
      }
    });
    
    const { access_token: long_lived_token, expires_in } = longLivedResponse.data;
    
    // Obter informações do usuário
    const userResponse = await axios.get(`https://graph.instagram.com/me`, {
      params: {
        fields: 'id,username',
        access_token: long_lived_token
      }
    });
    
    const { username } = userResponse.data;
    
    // Salvar ou atualizar a configuração do Instagram
    const instagramConfig = await prisma.instagramConfig.findFirst();
    
    if (instagramConfig) {
      await prisma.instagramConfig.update({
        where: { id: instagramConfig.id },
        data: {
          status: 'connected',
          accessToken: long_lived_token,
          username: username
        }
      });
    } else {
      await prisma.instagramConfig.create({
        data: {
          status: 'connected',
          accessToken: long_lived_token,
          username: username
        }
      });
    }
    
    // Exibir página de sucesso
    return new NextResponse(`
      <html>
        <head>
          <title>Autenticação do Instagram Concluída</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
            .success { color: green; background: #eeffee; padding: 10px; border-radius: 5px; }
            .code { background: #f0f0f0; padding: 10px; border-radius: 5px; font-family: monospace; overflow-x: auto; }
          </style>
        </head>
        <body>
          <h1>Autenticação do Instagram Concluída</h1>
          <div class="success">
            <p>Sua conta do Instagram foi conectada com sucesso!</p>
            <p><strong>Usuário:</strong> ${username}</p>
          </div>
          <h2>Código de Autorização</h2>
          <div class="code">${code}</div>
          <p>Você pode usar este código para obter um token de acesso usando o script:</p>
          <div class="code">node scripts/get-instagram-token.js ${code}</div>
          <p><a href="/">Voltar para a página inicial</a></p>
        </body>
      </html>
    `, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error: any) {
    console.error('❌ Erro ao obter token de acesso:', error.response?.data || error);
    
    return new NextResponse(`
      <html>
        <head>
          <title>Erro na Autenticação do Instagram</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
            .error { color: red; background: #ffeeee; padding: 10px; border-radius: 5px; }
            .code { background: #f0f0f0; padding: 10px; border-radius: 5px; font-family: monospace; overflow-x: auto; }
          </style>
        </head>
        <body>
          <h1>Erro na Autenticação do Instagram</h1>
          <div class="error">
            <p>Ocorreu um erro ao obter o token de acesso.</p>
            <p><strong>Erro:</strong> ${error.message}</p>
            ${error.response?.data ? `<p><strong>Detalhes:</strong> ${JSON.stringify(error.response.data)}</p>` : ''}
          </div>
          <h2>Código de Autorização</h2>
          <div class="code">${code}</div>
          <p>Você pode usar este código para obter um token de acesso usando o script:</p>
          <div class="code">node scripts/get-instagram-token.js ${code}</div>
          <p><a href="/">Voltar para a página inicial</a></p>
        </body>
      </html>
    `, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  }
} 