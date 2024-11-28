import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { leads } = await request.json()
    
    if (!leads || !Array.isArray(leads)) {
      return NextResponse.json(
        { error: 'Dados inválidos' },
        { status: 400 }
      )
    }

    const results = await Promise.all(
      leads.map(async (lead) => {
        try {
          // Tenta criar um novo lead ou atualizar se o email já existir
          const result = await prisma.lead.upsert({
            where: {
              email: lead.email
            },
            update: {
              name: lead.name,
              phone: lead.phone,
              source: lead.source,
              // Atualiza a data de criação para a mais recente
              createdAt: new Date()
            },
            create: {
              name: lead.name,
              email: lead.email,
              phone: lead.phone,
              source: lead.source
            }
          })
          return result
        } catch (error) {
          console.error(`Erro ao processar lead ${lead.email}:`, error)
          return null
        }
      })
    )

    // Filtra os resultados nulos (leads que falharam)
    const successfulResults = results.filter(result => result !== null)

    return NextResponse.json(successfulResults)
  } catch (error) {
    console.error('Erro ao importar leads:', error)
    return NextResponse.json(
      { error: 'Erro ao importar leads' },
      { status: 500 }
    )
  }
} 