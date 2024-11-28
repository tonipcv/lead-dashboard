import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const config = await prisma.whatsAppConfig.findFirst({
      where: { id: 1 }
    })

    return NextResponse.json({ 
      status: config?.status || 'disconnected' 
    })
  } catch (error) {
    console.error('Erro ao verificar status:', error)
    return NextResponse.json(
      { error: 'Erro ao verificar status' },
      { status: 500 }
    )
  }
} 