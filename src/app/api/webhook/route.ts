import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('Recebendo lead:', body)
    
    const lead = await prisma.lead.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        source: body.source,
      },
    })
    console.log('Lead criado:', lead)

    return NextResponse.json(lead, { status: 201 })
  } catch (error) {
    console.error('Erro ao processar lead:', error)
    return NextResponse.json(
      { error: 'Erro ao processar o lead' },
      { status: 400 }
    )
  }
} 