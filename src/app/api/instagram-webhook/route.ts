import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import fs from "fs";
import path from "path";

// Configurações do Instagram
const INSTAGRAM_APP_SECRET = process.env.INSTAGRAM_APP_SECRET || "71df1811f8c5f77d30012c470e2bf46c";
const VERIFY_TOKEN = process.env.INSTAGRAM_VERIFY_TOKEN || "H34g+PDCOI2Vi2ilavlhEsHYCRSeF19bMLUhC0OZ8Rs=";

// Função para verificar a assinatura do payload
function verifySignature(payload: string, signature: string): boolean {
  try {
    if (!signature) return false;
    
    const signatureParts = signature.split('=');
    if (signatureParts.length !== 2) return false;
    
    const signatureMethod = signatureParts[0];
    const signatureHash = signatureParts[1];
    
    if (signatureMethod !== 'sha256') return false;
    
    const expectedHash = crypto
      .createHmac('sha256', INSTAGRAM_APP_SECRET)
      .update(payload)
      .digest('hex');
    
    return expectedHash === signatureHash;
  } catch (error) {
    console.error("Erro ao verificar assinatura:", error);
    return false;
  }
}

// Função para salvar dados em um arquivo de log
function saveToLog(type: string, data: any) {
  try {
    const logDir = path.join(process.cwd(), 'logs');
    
    // Criar diretório de logs se não existir
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const logFile = path.join(logDir, `instagram-${type}-${timestamp}.json`);
    
    fs.writeFileSync(logFile, JSON.stringify(data, null, 2));
    console.log(`✅ Dados salvos em ${logFile}`);
  } catch (error) {
    console.error(`❌ Erro ao salvar log: ${error}`);
  }
}

// Função para processar notificações de comentários
async function processCommentNotification(entry: any) {
  try {
    const { changes } = entry;
    
    for (const change of changes) {
      if (change.field === 'comments') {
        const { value } = change;
        
        console.log(`📝 Novo comentário recebido:`, value);
        
        // Salvar em log em vez de banco de dados
        saveToLog('comment', {
          commentId: value.id || `unknown-${Date.now()}`,
          mediaId: value.media?.id || '',
          text: value.text || '',
          username: value.from?.username || '',
          timestamp: new Date().toISOString(),
          raw: value
        });
      }
    }
  } catch (error) {
    console.error("Erro ao processar notificação de comentário:", error);
  }
}

// Função para processar notificações de menções
async function processMentionNotification(entry: any) {
  try {
    const { changes } = entry;
    
    for (const change of changes) {
      if (change.field === 'mentions') {
        const { value } = change;
        
        console.log(`🔔 Nova menção recebida:`, value);
        
        // Salvar em log em vez de banco de dados
        saveToLog('mention', {
          mentionId: value.id || `unknown-${Date.now()}`,
          mediaId: value.media?.id || '',
          username: value.from?.username || '',
          text: value.text || '',
          timestamp: new Date().toISOString(),
          raw: value
        });
      }
    }
  } catch (error) {
    console.error("Erro ao processar notificação de menção:", error);
  }
}

// Função para processar notificações de mensagens
async function processMessageNotification(entry: any) {
  try {
    const { changes } = entry;
    
    for (const change of changes) {
      if (change.field === 'messages') {
        const { value } = change;
        
        console.log(`💬 Nova mensagem recebida:`, value);
        
        // Salvar em log em vez de banco de dados
        saveToLog('message', {
          messageId: value.id || `unknown-${Date.now()}`,
          from: value.from?.id || '',
          text: value.message || '',
          timestamp: new Date().toISOString(),
          raw: value
        });
      }
    }
  } catch (error) {
    console.error("Erro ao processar notificação de mensagem:", error);
  }
}

// Função para processar notificações de insights de stories
async function processStoryInsightsNotification(entry: any) {
  try {
    const { changes } = entry;
    
    for (const change of changes) {
      if (change.field === 'story_insights') {
        const { value } = change;
        
        console.log(`📊 Novos insights de story recebidos:`, value);
        
        // Salvar em log em vez de banco de dados
        saveToLog('story_insight', {
          storyId: value.story_id || `unknown-${Date.now()}`,
          metrics: value.metrics || {},
          timestamp: new Date().toISOString(),
          raw: value
        });
      }
    }
  } catch (error) {
    console.error("Erro ao processar notificação de insights de story:", error);
  }
}

// Endpoint para verificação do webhook (GET)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');
  
  console.log(`🔍 Solicitação de verificação recebida: mode=${mode}, token=${token}, challenge=${challenge}`);
  
  // Verificar se é uma solicitação de verificação válida
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Webhook verificado com sucesso!');
    return new NextResponse(challenge);
  } else {
    console.error('❌ Falha na verificação do webhook');
    return new NextResponse('Verification failed', { status: 403 });
  }
}

// Endpoint para receber notificações (POST)
export async function POST(request: NextRequest) {
  try {
    // Obter a assinatura do cabeçalho
    const signature = request.headers.get('x-hub-signature-256') || '';
    
    // Obter o corpo da solicitação como texto
    const body = await request.text();
    
    // Verificar a assinatura
    if (!verifySignature(body, signature)) {
      console.error('❌ Assinatura inválida');
      return new NextResponse('Invalid signature', { status: 403 });
    }
    
    // Converter o corpo para JSON
    const data = JSON.parse(body);
    console.log('📥 Notificação recebida:', data);
    
    // Salvar a notificação completa em log
    saveToLog('webhook', data);
    
    // Processar as entradas
    if (data.object === 'instagram' && Array.isArray(data.entry)) {
      for (const entry of data.entry) {
        // Processar diferentes tipos de notificações
        if (entry.changes) {
          for (const change of entry.changes) {
            switch (change.field) {
              case 'comments':
                await processCommentNotification(entry);
                break;
              case 'mentions':
                await processMentionNotification(entry);
                break;
              case 'messages':
                await processMessageNotification(entry);
                break;
              case 'story_insights':
                await processStoryInsightsNotification(entry);
                break;
              default:
                console.log(`📌 Notificação recebida para o campo: ${change.field}`);
                saveToLog(`field-${change.field}`, entry);
            }
          }
        }
      }
    }
    
    // Responder com sucesso
    return new NextResponse('EVENT_RECEIVED', { status: 200 });
  } catch (error) {
    console.error('❌ Erro ao processar notificação:', error);
    return new NextResponse('Error processing webhook', { status: 500 });
  }
} 