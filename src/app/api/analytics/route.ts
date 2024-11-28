import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    const lastWeek = new Date(today)
    lastWeek.setDate(lastWeek.getDate() - 7)
    
    const lastMonth = new Date(today)
    lastMonth.setMonth(lastMonth.getMonth() - 1)

    // Busca todos os leads
    const [
      totalLeads,
      todayLeads,
      yesterdayLeads,
      weekLeads,
      monthLeads,
      sourceStats
    ] = await Promise.all([
      // Total de leads
      prisma.lead.count(),
      
      // Leads de hoje
      prisma.lead.count({
        where: {
          createdAt: {
            gte: new Date(today.setHours(0, 0, 0, 0)),
            lt: new Date(today.setHours(23, 59, 59, 999)),
          },
        },
      }),
      
      // Leads de ontem
      prisma.lead.count({
        where: {
          createdAt: {
            gte: new Date(yesterday.setHours(0, 0, 0, 0)),
            lt: new Date(yesterday.setHours(23, 59, 59, 999)),
          },
        },
      }),
      
      // Leads da última semana
      prisma.lead.count({
        where: {
          createdAt: {
            gte: lastWeek,
          },
        },
      }),
      
      // Leads do último mês
      prisma.lead.count({
        where: {
          createdAt: {
            gte: lastMonth,
          },
        },
      }),

      // Estatísticas por origem
      prisma.lead.groupBy({
        by: ['source'],
        _count: {
          source: true,
        },
      }),
    ])

    // Calcula as estatísticas por origem
    const sourceData = sourceStats.map(stat => ({
      source: stat.source,
      count: stat._count.source,
      percentage: (stat._count.source / totalLeads) * 100
    })).sort((a, b) => b.count - a.count)

    // Calcula a taxa de crescimento
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
    console.error('Erro ao buscar analytics:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar dados analíticos' },
      { status: 500 }
    )
  }
} 