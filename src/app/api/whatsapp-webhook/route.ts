import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Set to force dynamic rendering for webhook routes
export const dynamic = 'force-dynamic';

// Verify token for WhatsApp webhook verification
const VERIFY_TOKEN = "ecdfdf5840d72cada28216b92ea1980c9f946a50879ebeb27d3e7e64dd76a6df"; // Token seguro gerado aleatoriamente

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  console.log("🔍 Recebida solicitação GET para verificação do webhook");
  console.log(`🔍 Mode: ${mode}, Token: ${token}, Challenge: ${challenge}`);

  // Verify the webhook
  if (mode && token === VERIFY_TOKEN) {
    console.log("✅ Webhook verificado com sucesso!");
    return new NextResponse(challenge);
  } else {
    console.log(`❌ Falha na verificação do webhook. Token recebido: ${token}`);
    return NextResponse.json({ error: "Falha na verificação" }, { status: 403 });
  }
}

export async function POST(request: NextRequest) {
  console.log("📥 Webhook POST recebido - Início do processamento");
  
  try {
    const body = await request.json();

    console.log("📩 Payload completo recebido:", JSON.stringify(body, null, 2));

    // Check if there's a message
    if (body.entry && body.entry[0].changes) {
      console.log("✅ Estrutura do payload válida, processando changes");
      
      const change = body.entry[0].changes[0];
      console.log("🔍 Conteúdo do change:", JSON.stringify(change, null, 2));
      
      const message = change.value.messages?.[0];

      if (message) {
        console.log("✅ Mensagem encontrada no payload");
        
        const messageId = message.id;
        const sender = message.from; // Sender's number
        const text = message.text?.body || ""; // Message text
        const timestamp = new Date(parseInt(message.timestamp) * 1000);

        console.log(`📩 Detalhes da mensagem - ID: ${messageId}, De: ${sender}, Texto: ${text}, Timestamp: ${timestamp}`);

        try {
          // Verificar se já existe um lead com este número de telefone
          console.log(`🔍 Buscando lead com telefone: ${sender}`);
          let lead = await prisma.lead.findFirst({
            where: {
              phone: sender
            }
          });

          // Se não existir, criar um novo lead
          if (!lead) {
            console.log(`🆕 Lead não encontrado, criando novo lead para: ${sender}`);
            lead = await prisma.lead.create({
              data: {
                name: `WhatsApp User ${sender.substring(sender.length - 4)}`,
                email: `whatsapp_${sender}@example.com`, // Email placeholder
                phone: sender,
                source: 'whatsapp',
                status: 'Novo'
              }
            });
            console.log(`✅ Novo lead criado com ID: ${lead.id}`);
          } else {
            console.log(`✅ Lead existente encontrado com ID: ${lead.id}`);
          }

          // Salvar a mensagem no banco de dados
          console.log(`💾 Salvando mensagem no banco de dados para lead ID: ${lead.id}`);
          const whatsappMessage = await prisma.whatsAppMessage.create({
            data: {
              messageId,
              sender,
              text,
              timestamp,
              leadId: lead.id
            }
          });

          console.log(`✅ Mensagem salva com sucesso, ID: ${whatsappMessage.id}`);
        } catch (dbError) {
          console.error("❌ Erro ao processar mensagem no banco de dados:", dbError);
        }
      } else {
        console.log("⚠️ Nenhuma mensagem encontrada no payload");
      }
    } else {
      console.log("⚠️ Estrutura do payload inválida ou sem mensagens");
    }

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("❌ Erro ao processar Webhook:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
} 