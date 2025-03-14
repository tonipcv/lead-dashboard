import { NextResponse } from "next/server"
import axios from "axios"

const WHATSAPP_API_VERSION = 'v18.0'
const WHATSAPP_API_URL = 'https://graph.facebook.com'
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || "392829143915527"
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || "EAAKeUEkk590BO6BZAZBANqeqKQxFNmFjkzjnfHwbpt7uzWBQWvFIDwqTZBQOqRAWg3kZC06Xz0XadxzEqwtQdagq3WFOsCozmYZAJqhcvIoYmdv9PnoLx7mZAf65n41ckZAiJmYW1pENfMUsfW9ZBAoGUhpSs02Bv7OnHmTgu9WSsDkaNR52K1DQ8xjWIZCtRsAEB2NIJIlCzzGSAMeBmEoi9chCCc0Tr1LZARXayJo4uO"

export async function GET() {
  try {
    // Buscar informações do perfil de negócios
    const profileResponse = await axios.get(
      `${WHATSAPP_API_URL}/${WHATSAPP_API_VERSION}/${PHONE_NUMBER_ID}`,
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        }
      }
    )

    // Buscar mensagens diretamente
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

    const messages = (messagesResponse.data.data || []).map((msg: any) => ({
      id: msg.id,
      from: msg.from,
      to: msg.to,
      text: msg.text?.body || '',
      timestamp: msg.timestamp,
      type: msg.from === PHONE_NUMBER_ID ? 'sent' : 'received'
    }))

    // Sort messages by timestamp, most recent first
    messages.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return NextResponse.json({
      profile: profileResponse.data,
      messages: messages
    })
  } catch (error: any) {
    console.error("Erro ao buscar mensagens:", error.response?.data || error)
    return NextResponse.json(
      { 
        error: "Erro ao buscar mensagens",
        details: error.response?.data?.error?.message || error.message
      },
      { status: 500 }
    )
  }
} 