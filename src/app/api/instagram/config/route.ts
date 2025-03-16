import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const config = await prisma.instagramConfig.findFirst({
      orderBy: {
        updatedAt: 'desc'
      }
    })

    if (!config) {
      return NextResponse.json({
        id: 0,
        status: 'disconnected',
        username: null,
        accessToken: null,
        updatedAt: new Date().toISOString()
      })
    }

    return NextResponse.json({
      id: config.id,
      status: config.accessToken ? 'connected' : 'disconnected',
      username: config.username,
      accessToken: config.accessToken,
      updatedAt: config.updatedAt.toISOString()
    })
  } catch (error) {
    console.error('Erro ao buscar configuração do Instagram:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar configuração do Instagram' },
      { status: 500 }
    )
  }
} 