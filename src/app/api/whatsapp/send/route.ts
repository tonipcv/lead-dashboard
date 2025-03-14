import { NextResponse } from "next/server"
import axios from "axios"
import { prisma } from "@/lib/prisma"

const WHATSAPP_API_VERSION = 'v22.0'
const WHATSAPP_API_URL = 'https://graph.facebook.com'
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || "392829143915527"
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || "EAAKeUEkk590BO6BZAZBANqeqKQxFNmFjkzjnfHwbpt7uzWBQWvFIDwqTZBQOqRAWg3kZC06Xz0XadxzEqwtQdagq3WFOsCozmYZAJqhcvIoYmdv9PnoLx7mZAf65n41ckZAiJmYW1pENfMUsfW9ZBAoGUhpSs02Bv7OnHmTgu9WSsDkaNR52K1DQ8xjWIZCtRsAEB2NIJIlCzzGSAMeBmEoi9chCCc0Tr1LZARXayJo4uO"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { phone, leadId } = body

    if (!phone || !leadId) {
      return NextResponse.json(
        { error: "Número de telefone e ID do lead são obrigatórios" },
        { status: 400 }
      )
    }

    // Remove any non-numeric characters
    let formattedPhone = phone.replace(/\D/g, '')
    
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

    const response = await axios.post(
      `${WHATSAPP_API_URL}/${WHATSAPP_API_VERSION}/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: formattedPhone,
        type: "template",
        template: {
          name: "marco_antecipacao",
          language: {
            code: "pt_BR"
          }
        }
      },
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    )

    // Mark the lead as having received the message
    await prisma.lead.update({
      where: { id: leadId },
      data: { messageSent: true }
    })

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
          text: "Template: marco_antecipacao", // Template message
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