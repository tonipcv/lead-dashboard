import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // O Elementor envia os dados no formato form_fields
    const formFields = body.form_fields || body

    // Mapeia os campos do formulário do Elementor
    // Você pode ajustar os IDs (form_fields.field_1) de acordo com seu formulário
    const leadData = {
      name: formFields.field_1 || formFields.name || '',  // campo de nome
      email: formFields.field_2 || formFields.email || '', // campo de email
      phone: formFields.field_3 || formFields.phone || '', // campo de telefone
      source: 'Elementor Form'
    }

    // Validação dos campos obrigatórios
    if (!leadData.name || !leadData.email || !leadData.phone) {
      return NextResponse.json(
        { 
          error: 'Campos obrigatórios faltando',
          received: leadData,
          required: ['name', 'email', 'phone']
        },
        { status: 400 }
      )
    }

    // Cria o lead
    const lead = await prisma.lead.create({
      data: leadData
    })

    return NextResponse.json(
      { success: true, message: 'Lead criado com sucesso', lead },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erro no webhook:', error)
    return NextResponse.json(
      { error: 'Erro ao processar webhook', details: error },
      { status: 500 }
    )
  }
} 