import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parse } from 'querystring'

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || ''
    let formFields

    if (contentType.includes('application/json')) {
      const body = await request.json()
      formFields = body.form_fields || body
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const text = await request.text()
      formFields = parse(text)
    } else {
      return NextResponse.json(
        { error: 'Unsupported content type' },
        { status: 415 }
      )
    }

    // Mapeia os campos do formulário do Elementor
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