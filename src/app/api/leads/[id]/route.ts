import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)

    await prisma.lead.delete({
      where: {
        id: id,
      },
    })

    return NextResponse.json({ message: 'Lead excluído com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir lead:', error)
    return NextResponse.json(
      { error: 'Erro ao excluir lead' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    const body = await request.json()

    const updatedLead = await prisma.lead.update({
      where: {
        id: id,
      },
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        source: body.source,
      },
    })

    return NextResponse.json(updatedLead)
  } catch (error) {
    console.error('Erro ao atualizar lead:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar lead' },
      { status: 500 }
    )
  }
} 