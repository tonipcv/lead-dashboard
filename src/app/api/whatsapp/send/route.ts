import { NextResponse } from "next/server"
import axios from "axios"
import { prisma } from "@/lib/prisma"

const WHATSAPP_API_VERSION = 'v22.0'
const WHATSAPP_API_URL = 'https://graph.facebook.com'
const PHONE_NUMBER_ID = "392829143915527"
const ACCESS_TOKEN = "EAAKeUEkk590BO51IBeXUMDJS9D3wBR6EaOPhO6enUGnpcO32kn8QmfaLFg8tr8RixA55q6Yapp0z1zkevRodpOkjZC5FtaNUThLZCJw1oef8IpmRDZBEAqVZAZC9mMGsi3OrhX5FARA2oipE9uYq2oqA76Phu1mYZBj0kAYOnDvUB766XynjwZCbhevtxyEBlWIauZBmJ80qKVnbJeNoFF5zYVEZC"

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