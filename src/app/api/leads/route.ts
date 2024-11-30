import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const skip = (page - 1) * pageSize

    console.log('Buscando leads:', { page, pageSize, skip })

    const [total, leads] = await Promise.all([
      prisma.lead.count(),
      prisma.lead.findMany({
        skip,
        take: pageSize,
        orderBy: {
          createdAt: 'desc'
        }
      })
    ])

    const totalPages = Math.ceil(total / pageSize)

    console.log('Leads encontrados:', { total, totalPages, leadsCount: leads.length })

    return NextResponse.json({
      leads: leads || [],
      total,
      totalPages,
      currentPage: page
    })
  } catch (error) {
    console.error('Erro ao buscar leads:', error)
    return NextResponse.json(
      { 
        leads: [],
        total: 0,
        totalPages: 0,
        currentPage: 1,
        error: 'Erro ao buscar leads'
      },
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
        source: body.source
      }
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