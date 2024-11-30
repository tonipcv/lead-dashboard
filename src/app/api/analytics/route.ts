import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function GET() {
  try {
    // Teste de conexão com o banco
    await prisma.$connect()
    
    const now = new Date()
    
    // Cria cópias independentes da data
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
    
    const yesterdayStart = new Date(todayStart)
    yesterdayStart.setDate(yesterdayStart.getDate() - 1)
    const yesterdayEnd = new Date(todayEnd)
    yesterdayEnd.setDate(yesterdayEnd.getDate() - 1)
    
    const lastWeek = new Date(now)
    lastWeek.setDate(lastWeek.getDate() - 7)
    
    const lastMonth = new Date(now)
    lastMonth.setMonth(lastMonth.getMonth() - 1)

    const [
      totalLeads,
      todayLeads,
      yesterdayLeads,
      weekLeads,
      monthLeads,
      sourceStats
    ] = await Promise.all([
      prisma.lead.count(),
      
      prisma.lead.count({
        where: {
          createdAt: {
            gte: todayStart,
            lte: todayEnd,
          },
        },
      }),
      
      prisma.lead.count({
        where: {
          createdAt: {
            gte: yesterdayStart,
            lte: yesterdayEnd,
          },
        },
      }),
      
      prisma.lead.count({
        where: {
          createdAt: {
            gte: lastWeek,
          },
        },
      }),
      
      prisma.lead.count({
        where: {
          createdAt: {
            gte: lastMonth,
          },
        },
      }),

      prisma.lead.groupBy({
        by: ['source'],
        _count: {
          source: true,
        },
      }),
    ])

    const sourceData = sourceStats.map(stat => ({
      source: stat.source,
      count: stat._count.source,
      percentage: (stat._count.source / totalLeads) * 100
    })).sort((a, b) => b.count - a.count)

    const growthRate = yesterdayLeads 
      ? ((todayLeads - yesterdayLeads) / yesterdayLeads) * 100 
      : 0

    return NextResponse.json({
      totalLeads,
      todayLeads,
      yesterdayLeads,
      weekLeads,
      monthLeads,
      growthRate,
      sourceData
    })
  } catch (error) {
    console.error('Erro detalhado:', error)
    
    if (error instanceof Prisma.PrismaClientInitializationError) {
      return NextResponse.json(
        { error: 'Erro de conexão com o banco de dados' },
        { status: 503 }
      )
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        { error: `Erro do Prisma: ${error.code}` },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 