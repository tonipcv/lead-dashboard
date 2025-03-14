import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Fetch all unique sources from the database
    const results = await prisma.lead.findMany({
      select: {
        source: true
      },
      distinct: ['source'],
      where: {
        source: {
          not: ''
        }
      }
    });

    // Extract and filter out any null or empty sources
    const sources = results
      .map(result => result.source)
      .filter(Boolean) as string[];

    return NextResponse.json({
      sources
    });
  } catch (error) {
    console.error('Erro ao buscar origens:', error);
    return NextResponse.json(
      { 
        sources: [],
        error: 'Erro ao buscar origens'
      },
      { status: 500 }
    );
  }
} 