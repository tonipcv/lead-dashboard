import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const templates = await prisma.emailTemplate.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error('Erro ao buscar templates:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar templates' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, subject, text, html } = body;

    // Validação básica
    if (!name || !subject) {
      return NextResponse.json(
        { error: 'Nome e assunto são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se já existe um template com este nome
    const existingTemplate = await prisma.emailTemplate.findUnique({
      where: { name }
    });

    if (existingTemplate) {
      return NextResponse.json(
        { error: 'Já existe um template com este nome' },
        { status: 400 }
      );
    }

    // Criar o template
    const template = await prisma.emailTemplate.create({
      data: {
        name,
        subject,
        text,
        html
      }
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar template:', error);
    return NextResponse.json(
      { error: 'Erro ao criar template' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, subject, text, html } = body;

    if (!id || !name || !subject) {
      return NextResponse.json(
        { error: 'ID, nome e assunto são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se o template existe
    const existingTemplate = await prisma.emailTemplate.findUnique({
      where: { id }
    });

    if (!existingTemplate) {
      return NextResponse.json(
        { error: 'Template não encontrado' },
        { status: 404 }
      );
    }

    // Atualizar o template
    const template = await prisma.emailTemplate.update({
      where: { id },
      data: {
        name,
        subject,
        text,
        html
      }
    });

    return NextResponse.json(template);
  } catch (error) {
    console.error('Erro ao atualizar template:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar template' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID é obrigatório' },
        { status: 400 }
      );
    }

    await prisma.emailTemplate.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir template:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir template' },
      { status: 500 }
    );
  }
} 