import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Aqui você implementaria a lógica real de verificação do status do WhatsApp
    // Por enquanto, vamos retornar um status mockado
    return NextResponse.json({ 
      status: 'connected',
      qrCode: null 
    })
  } catch (error) {
    console.error('Erro ao verificar status do WhatsApp:', error)
    return NextResponse.json(
      { error: 'Erro ao verificar status do WhatsApp' },
      { status: 500 }
    )
  }
} 