import { NextResponse } from "next/server"
import axios from "axios"

const WHATSAPP_API_VERSION = 'v22.0'
const WHATSAPP_API_URL = 'https://graph.facebook.com'
const PHONE_NUMBER_ID = "392829143915527"
const ACCESS_TOKEN = "EAAKeUEkk590BOxqWr58grMS6kOFdpzv5XiZAfFDGyUDs34ueRhe9yZA1fhl4j0IsDrOqHrDnw9XjljtQ8gZCy6OUknjYHrUfkXJMVFXy2g9HP5MCotpX7YPOOMHFA3eEPg6kThmrzx6IzT6nAG6j0LbbZAZBmZCyMC14JU8iZCZAB1s9KJZCQM6jBRFB9kebX443Py5jWAN9PfkPbhaEn65yqidSZA"

export async function GET() {
  try {
    const response = await axios.get(
      `${WHATSAPP_API_URL}/${WHATSAPP_API_VERSION}/${PHONE_NUMBER_ID}/conversations`,
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        }
      }
    )

    // Get messages from each conversation
    const conversations = response.data.data || []
    const allMessages = []

    for (const conversation of conversations) {
      const messagesResponse = await axios.get(
        `${WHATSAPP_API_URL}/${WHATSAPP_API_VERSION}/${conversation.id}/messages`,
        {
          headers: {
            Authorization: `Bearer ${ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          }
        }
      )

      const messages = (messagesResponse.data.data || []).map((msg: any) => ({
        id: msg.id,
        from: msg.from || conversation.contact_phone,
        text: msg.text?.body || '',
        timestamp: msg.timestamp,
        type: msg.from === PHONE_NUMBER_ID ? 'sent' : 'received'
      }))

      allMessages.push(...messages)
    }

    // Sort messages by timestamp, most recent first
    allMessages.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return NextResponse.json({
      messages: allMessages
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