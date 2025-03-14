import { NextResponse } from "next/server"
import axios from "axios"
import { prisma } from "@/lib/prisma"

const WHATSAPP_API_VERSION = 'v22.0'
const WHATSAPP_API_URL = 'https://graph.facebook.com'
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || "392829143915527"
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || "EAAKeUEkk590BOyzMowHTXYxRIl7dL61v5nSZAGC1A3Luu8PocFoPTMr8yUJj44Ip2BkF8kXJVa1YxQGW2BYgI2oZBLloTQEhFsVZByZCeOKuBQ5KkupZBEHlcKnhcIVVAN0r5U86blS8aWjBvmfcZCxHtMoC5KWpAv5ZAC6zkaRlfQ7V11NEuK8b7dd5biaoTfvR0VdXc1gkH7IXnmXlu9BEdVK"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { leadId, text } = body

    if (!leadId || !text) {
      return NextResponse.json(
        { error: "ID do lead e texto da mensagem são obrigatórios" },
        { status: 400 }
      )
    }

    // Get the lead to find the phone number
    const lead = await prisma.lead.findUnique({
      where: { id: leadId }
    })

    if (!lead) {
      return NextResponse.json(
        { error: "Lead não encontrado" },
        { status: 404 }
      )
    }

    // Format the phone number
    let formattedPhone = lead.phone.replace(/\D/g, '')
    
    // Check if it's an international number (more than 12 digits or starts with country code)
    const isInternational = formattedPhone.length > 12 || /^[1-9][0-9][0-9]/.test(formattedPhone)
    
    if (!isInternational) {
      // If it's a Brazilian number and doesn't have country code, add it
      if (!formattedPhone.startsWith('55')) {
        formattedPhone = `55${formattedPhone}`
      }
    }

    // Log the formatted phone for debugging
    console.log('Número formatado:', formattedPhone)

    // Send the message
    const response = await axios.post(
      `${WHATSAPP_API_URL}/${WHATSAPP_API_VERSION}/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: formattedPhone,
        type: "text",
        text: {
          body: text
        }
      },
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    )

    // Log the API response for debugging
    console.log('Resposta da API:', response.data)

    // Save the sent message to the database
    if (response.data && response.data.messages && response.data.messages.length > 0) {
      const messageId = response.data.messages[0].id;
      
      console.log(`💾 Salvando mensagem enviada no banco de dados, ID: ${messageId}`);
      
      // Save the message to the WhatsAppMessage table
      await prisma.whatsAppMessage.create({
        data: {
          messageId: messageId,
          sender: PHONE_NUMBER_ID, // Sent from the business account
          text: text,
          timestamp: new Date(),
          isFromMe: true, // Message sent by us
          leadId: leadId // Associate with the lead
        }
      });
      
      console.log(`✅ Mensagem enviada salva com sucesso no banco de dados`);
    }

    return NextResponse.json({
      success: true,
      data: response.data
    })
  } catch (error: any) {
    // Log the complete error for debugging
    console.error("Erro completo ao enviar mensagem:", error)
    console.error("Detalhes da resposta:", error.response?.data)
    
    return NextResponse.json(
      { 
        error: "Erro ao enviar mensagem",
        details: error.response?.data?.error?.message || error.message
      },
      { status: 500 }
    )
  }
} 