import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const config = await prisma.whatsAppConfig.findFirst({
      where: { id: 1 }
    })

    return NextResponse.json({ 
      qrCode: config?.qrCode || null
    })
  } catch (error) {
    console.error('Erro ao buscar QR code:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar QR code' },
      { status: 500 }
    )
  }
} 