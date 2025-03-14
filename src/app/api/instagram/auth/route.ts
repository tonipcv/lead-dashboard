import { NextRequest, NextResponse } from "next/server";

// Configurações do Instagram
const INSTAGRAM_APP_ID = process.env.INSTAGRAM_APP_ID || '2576913712507077';
const REDIRECT_URI = process.env.INSTAGRAM_REDIRECT_URI || 'https://seu-dominio.com/api/instagram/auth/callback';

export async function GET(request: NextRequest) {
  // Construir a URL de autorização do Instagram com todos os escopos necessários
  const scopes = [
    'instagram_business_basic',
    'instagram_business_manage_messages',
    'instagram_business_manage_comments',
    'instagram_business_content_publish',
    'instagram_business_manage_insights'
  ].join(',');

  const authUrl = `https://www.instagram.com/oauth/authorize
    ?client_id=${INSTAGRAM_APP_ID}
    &redirect_uri=${encodeURIComponent(REDIRECT_URI)}
    &scope=${encodeURIComponent(scopes)}
    &response_type=code
    &enable_fb_login=0
    &force_authentication=1`;
  
  // Redirecionar para a URL de autorização
  return NextResponse.redirect(authUrl);
} 