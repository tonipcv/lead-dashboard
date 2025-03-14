import { NextRequest, NextResponse } from "next/server";

// Configurações do Instagram
const INSTAGRAM_APP_ID = process.env.INSTAGRAM_APP_ID || '2576913712507077';
const REDIRECT_URI = process.env.INSTAGRAM_REDIRECT_URI || 'https://seu-dominio.com/api/instagram/auth/callback';

export async function GET(request: NextRequest) {
  // Construir a URL de autorização do Instagram
  const authUrl = `https://api.instagram.com/oauth/authorize?client_id=${INSTAGRAM_APP_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=user_profile,user_media&response_type=code`;
  
  // Redirecionar para a URL de autorização
  return NextResponse.redirect(authUrl);
} 