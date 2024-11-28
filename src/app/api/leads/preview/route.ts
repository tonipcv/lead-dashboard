import { NextRequest, NextResponse } from 'next/server'
import { parse } from 'csv-parse/sync'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'Nenhum arquivo fornecido' },
        { status: 400 }
      )
    }

    const csvText = await file.text()
    const records = parse(csvText, {
      columns: true,
      skip_empty_lines: true,
    })

    const headers = Object.keys(records[0] || {})

    return NextResponse.json({
      headers,
      data: records
    })
  } catch (error) {
    console.error('Erro ao processar CSV:', error)
    return NextResponse.json(
      { error: 'Erro ao processar arquivo CSV' },
      { status: 500 }
    )
  }
} 