import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const { leads } = await request.json()
    
    if (!leads || !Array.isArray(leads)) {
      return NextResponse.json(
        { error: 'Dados inválidos' },
        { status: 400 }
      )
    }

    const results = {
      success: 0,
      updated: 0,
      failed: 0,
      errors: [] as string[]
    }

    // Validar e limpar os dados antes de processar
    const validLeads = leads.map(lead => ({
      name: String(lead.name || '').trim(),
      email: String(lead.email || '').trim().toLowerCase(),
      phone: String(lead.phone || '').trim(),
      source: String(lead.source || '').trim()
    }))

    for (const lead of validLeads) {
      // Validar dados obrigatórios
      if (!lead.name || !lead.email || !lead.phone || !lead.source) {
        results.failed++
        results.errors.push(`Lead com email ${lead.email} possui campos obrigatórios vazios`)
        continue
      }

      try {
        // Verificar se o email é válido
        if (!lead.email.includes('@')) {
          results.failed++
          results.errors.push(`Email inválido: ${lead.email}`)
          continue
        }

        const existingLead = await prisma.lead.findFirst({
          where: { email: lead.email }
        })

        if (existingLead) {
          // Atualiza o lead existente
          await prisma.lead.update({
            where: { id: existingLead.id },
            data: {
              name: lead.name,
              phone: lead.phone,
              source: lead.source,
              createdAt: new Date()
            }
          })
          results.updated++
        } else {
          // Cria um novo lead
          await prisma.lead.create({
            data: {
              name: lead.name,
              email: lead.email,
              phone: lead.phone,
              source: lead.source
            }
          })
          results.success++
        }
      } catch (error) {
        results.failed++
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
        results.errors.push(`Erro ao processar lead ${lead.email}: ${errorMessage}`)
      }
    }

    // Se todos falharam, retorna erro
    if (results.failed === leads.length) {
      return NextResponse.json(
        { 
          error: 'Falha ao importar todos os leads',
          details: results.errors
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: `Importação concluída: ${results.success} leads criados, ${results.updated} atualizados, ${results.failed} falhas`,
      results
    })
  } catch (error) {
    console.error('Erro ao importar leads:', error)
    return NextResponse.json(
      { 
        error: 'Erro ao importar leads',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
} 