import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function GET() {
  try {
    await prisma.$connect()
    
    const now = new Date()
    
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

    const sourceData = sourceStats?.map(stat => ({
      source: stat.source || 'Desconhecido',
      count: stat._count.source || 0,
      percentage: totalLeads ? ((stat._count.source || 0) / totalLeads) * 100 : 0
    })).sort((a, b) => b.count - a.count) || []

    const growthRate = yesterdayLeads 
      ? ((todayLeads - yesterdayLeads) / yesterdayLeads) * 100 
      : 0

    return NextResponse.json({
      totalLeads: totalLeads || 0,
      todayLeads: todayLeads || 0,
      yesterdayLeads: yesterdayLeads || 0,
      weekLeads: weekLeads || 0,
      monthLeads: monthLeads || 0,
      growthRate: growthRate || 0,
      sourceData: sourceData || []
    })
  } catch (error) {
    console.error('Erro detalhado:', error)
    
    return NextResponse.json({
      totalLeads: 0,
      todayLeads: 0,
      yesterdayLeads: 0,
      weekLeads: 0,
      monthLeads: 0,
      growthRate: 0,
      sourceData: [],
      error: 'Erro ao carregar dados'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
} 