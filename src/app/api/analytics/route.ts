import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function GET() {
  try {
    console.log('Iniciando requisição GET /api/analytics')
    
    await prisma.$connect()
    console.log('Conexão com o banco estabelecida')
    
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

    console.log('Buscando dados do banco...')

    // Primeiro, vamos verificar se há leads no banco
    const hasLeads = await prisma.lead.findFirst()
    
    if (!hasLeads) {
      console.log('Nenhum lead encontrado no banco')
      return NextResponse.json({
        totalLeads: 0,
        todayLeads: 0,
        yesterdayLeads: 0,
        weekLeads: 0,
        monthLeads: 0,
        growthRate: 0,
        sourceData: []
      })
    }

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

    console.log('Dados obtidos do banco:', { totalLeads, todayLeads, yesterdayLeads, weekLeads, monthLeads })
    console.log('Source stats:', sourceStats)

    // Garantir que sourceStats é um array
    const safeSourceStats = Array.isArray(sourceStats) ? sourceStats : []

    const sourceData = safeSourceStats.map(stat => ({
      source: stat.source || 'Desconhecido',
      count: stat._count.source || 0,
      percentage: totalLeads ? ((stat._count.source || 0) / totalLeads) * 100 : 0
    })).sort((a, b) => b.count - a.count)

    const growthRate = yesterdayLeads 
      ? ((todayLeads - yesterdayLeads) / yesterdayLeads) * 100 
      : 0

    const response = {
      totalLeads: totalLeads || 0,
      todayLeads: todayLeads || 0,
      yesterdayLeads: yesterdayLeads || 0,
      weekLeads: weekLeads || 0,
      monthLeads: monthLeads || 0,
      growthRate: growthRate || 0,
      sourceData: sourceData || []
    }
    
    console.log('Resposta final:', response)
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('Erro detalhado:', error)
    
    // Garantir que sempre retornamos uma resposta válida mesmo em caso de erro
    return NextResponse.json({
      totalLeads: 0,
      todayLeads: 0,
      yesterdayLeads: 0,
      weekLeads: 0,
      monthLeads: 0,
      growthRate: 0,
      sourceData: [],
      error: error instanceof Error ? error.message : 'Erro ao carregar dados'
    })
  } finally {
    await prisma.$disconnect()
  }
} 