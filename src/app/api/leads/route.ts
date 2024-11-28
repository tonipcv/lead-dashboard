import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const skip = (page - 1) * pageSize

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        skip,
        take: pageSize,
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.lead.count()
    ])

    return NextResponse.json({
      leads,
      total,
      totalPages: Math.ceil(total / pageSize)
    })
  } catch (error) {
    console.error('Erro ao buscar leads:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar leads' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const lead = await prisma.lead.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        source: body.source,
        status: body.status,
      },
    })

    return NextResponse.json(lead)
  } catch (error) {
    console.error('Erro ao criar lead:', error)
    return NextResponse.json(
      { error: 'Erro ao criar lead' },
      { status: 500 }
    )
  }
} 