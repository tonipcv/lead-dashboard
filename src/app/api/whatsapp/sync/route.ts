import { NextResponse } from "next/server"
import axios from "axios"
import { prisma } from "@/lib/prisma"

const WHATSAPP_API_VERSION = 'v18.0'
const WHATSAPP_API_URL = 'https://graph.facebook.com'
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || "392829143915527"
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || "EAAKeUEkk590BO6BZAZBANqeqKQxFNmFjkzjnfHwbpt7uzWBQWvFIDwqTZBQOqRAWg3kZC06Xz0XadxzEqwtQdagq3WFOsCozmYZAJqhcvIoYmdv9PnoLx7mZAf65n41ckZAiJmYW1pENfMUsfW9ZBAoGUhpSs02Bv7OnHmTgu9WSsDkaNR52K1DQ8xjWIZCtRsAEB2NIJIlCzzGSAMeBmEoi9chCCc0Tr1LZARXayJo4uO"

export async function GET() {
  try {
    console.log("🔄 Iniciando sincronização de mensagens do WhatsApp")
    
    // Buscar mensagens diretamente do número de telefone
    const messagesResponse = await axios.get(
      `${WHATSAPP_API_URL}/${WHATSAPP_API_VERSION}/${PHONE_NUMBER_ID}/messages`,
      {
        params: {
          limit: 100 // Aumentamos o limite para obter mais mensagens
        },
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        }
      }
    )
    
    console.log("✅ Mensagens obtidas com sucesso")
    
    const messages = messagesResponse.data.data || []
    console.log(`📥 Total de ${messages.length} mensagens encontradas`)
    
    // Processar as mensagens
    const processedMessages = messages.map((msg: any) => ({
      id: msg.id,
      from: msg.from,
      to: msg.to,
      text: msg.text?.body || '',
      timestamp: new Date(msg.timestamp),
      isFromMe: msg.from === PHONE_NUMBER_ID
    }))
    
    // Process each message
    const results = {
      total: processedMessages.length,
      saved: 0,
      skipped: 0,
      errors: 0
    }

    for (const message of processedMessages) {
      try {
        // Check if message already exists in database
        const existingMessage = await prisma.whatsAppMessage.findUnique({
          where: {
            messageId: message.id
          }
        })

        if (existingMessage) {
          console.log(`⏭️ Mensagem ${message.id} já existe no banco de dados`)
          results.skipped++
          continue
        }

        // Determine the phone number (sender or recipient)
        const phoneNumber = message.isFromMe ? message.to : message.from
        
        // Find or create lead based on phone number
        let lead = await prisma.lead.findFirst({
          where: {
            phone: phoneNumber
          }
        })

        if (!lead) {
          console.log(`🆕 Criando novo lead para o número ${phoneNumber}`)
          lead = await prisma.lead.create({
            data: {
              name: `WhatsApp User ${phoneNumber.substring(phoneNumber.length - 4)}`,
              email: `whatsapp_${phoneNumber}@example.com`,
              phone: phoneNumber,
              source: 'whatsapp',
              status: 'Novo'
            }
          })
        }

        // Save message to database
        await prisma.whatsAppMessage.create({
          data: {
            messageId: message.id,
            sender: message.from,
            text: message.text,
            timestamp: message.timestamp,
            isFromMe: message.isFromMe,
            leadId: lead.id
          }
        })

        console.log(`✅ Mensagem ${message.id} salva com sucesso`)
        results.saved++
      } catch (error) {
        console.error(`❌ Erro ao processar mensagem ${message.id}:`, error)
        results.errors++
      }
    }

    return NextResponse.json({
      success: true,
      results
    })
  } catch (error: any) {
    console.error("Erro ao sincronizar mensagens:", error.response?.data || error)
    return NextResponse.json(
      { 
        error: "Erro ao sincronizar mensagens",
        details: error.response?.data?.error?.message || error.message
      },
      { status: 500 }
    )
  }
} 