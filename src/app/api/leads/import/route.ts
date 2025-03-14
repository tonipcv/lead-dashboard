import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { leads } = body

    if (!leads || !Array.isArray(leads) || leads.length === 0) {
      return NextResponse.json(
        { error: "Nenhum lead válido para importação" },
        { status: 400 }
      )
    }

    // Processar em lotes para evitar sobrecarga do banco de dados
    const BATCH_SIZE = 100;
    let importedCount = 0;
    let duplicateCount = 0;
    let errorCount = 0;

    // Função para processar um lote
    const processBatch = async (batch: any[]) => {
      const results = await Promise.allSettled(
        batch.map(async (lead) => {
          try {
            // Verificar se já existe um lead com este email
            const existingLead = await prisma.lead.findFirst({
              where: {
                email: lead.email
              }
            });

            if (existingLead) {
              duplicateCount++;
              return { status: 'duplicate' };
            }

            // Criar o lead
            await prisma.lead.create({
              data: {
                name: lead.name || 'Sem nome',
                email: lead.email || 'sem-email@exemplo.com',
                phone: lead.phone || '',
                source: lead.source || 'Importação CSV',
              }
            });
            
            importedCount++;
            return { status: 'success' };
          } catch (error) {
            errorCount++;
            console.error('Erro ao importar lead:', error);
            return { status: 'error', error };
          }
        })
      );

      return results;
    };

    // Processar os lotes
    for (let i = 0; i < leads.length; i += BATCH_SIZE) {
      const batch = leads.slice(i, i + BATCH_SIZE);
      await processBatch(batch);
    }

    return NextResponse.json({
      success: true,
      message: `Importação concluída: ${importedCount} leads importados, ${duplicateCount} duplicados, ${errorCount} erros.`
    });
  } catch (error) {
    console.error('Erro ao importar leads:', error)
    return NextResponse.json(
      { error: "Erro ao importar leads" },
      { status: 500 }
    )
  }
} 