import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    // Aqui você implementaria a lógica para gerar o QR Code do WhatsApp
    // Usando uma biblioteca como whatsapp-web.js
    const qrCode = 'QR_CODE_BASE64_STRING' // Exemplo

    await prisma.whatsAppConfig.upsert({
      where: { id: 1 },
      update: {
        qrCode,
        status: 'pending'
      },
      create: {
        qrCode,
        status: 'pending'
      }
    })

    return NextResponse.json({ qrCode })
  } catch (error) {
    console.error('Erro ao gerar QR Code:', error)
    return NextResponse.json(
      { error: 'Erro ao gerar QR Code' },
      { status: 500 }
    )
  }
} 