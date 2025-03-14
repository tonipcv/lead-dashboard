import { NextResponse } from "next/server"
import axios from "axios"

const WHATSAPP_API_VERSION = 'v22.0'
const WHATSAPP_API_URL = 'https://graph.facebook.com'
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || "392829143915527"
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || "EAAKeUEkk590BOyzMowHTXYxRIl7dL61v5nSZAGC1A3Luu8PocFoPTMr8yUJj44Ip2BkF8kXJVa1YxQGW2BYgI2oZBLloTQEhFsVZByZCeOKuBQ5KkupZBEHlcKnhcIVVAN0r5U86blS8aWjBvmfcZCxHtMoC5KWpAv5ZAC6zkaRlfQ7V11NEuK8b7dd5biaoTfvR0VdXc1gkH7IXnmXlu9BEdVK"

export async function GET() {
  try {
    // Updated to use the business_profile endpoint instead of conversations
    // This will get the business profile information
    const profileResponse = await axios.get(
      `${WHATSAPP_API_URL}/${WHATSAPP_API_VERSION}/${PHONE_NUMBER_ID}`,
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        }
      }
    )

    // Get messages directly using the /messages endpoint
    const messagesResponse = await axios.get(
      `${WHATSAPP_API_URL}/${WHATSAPP_API_VERSION}/${PHONE_NUMBER_ID}/messages`,
      {
        params: {
          limit: 20 // Limit to 20 most recent messages
        },
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        }
      }
    )

    const messages = (messagesResponse.data.data || []).map((msg: any) => ({
      id: msg.id,
      from: msg.from || msg.to,
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