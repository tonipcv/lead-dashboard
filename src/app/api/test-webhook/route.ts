import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({ message: "Use POST para testar o webhook" });
}

export async function POST(request: NextRequest) {
  try {
    // Simular o envio de uma mensagem para o webhook do WhatsApp
    const response = await fetch(`${request.nextUrl.origin}/api/whatsapp-webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "object": "whatsapp_business_account",
        "entry": [
          {
            "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
            "changes": [
              {
                "value": {
                  "messaging_product": "whatsapp",
                  "metadata": {
                    "display_phone_number": "DISPLAY_PHONE_NUMBER",
                    "phone_number_id": "PHONE_NUMBER_ID"
                  },
                  "contacts": [
                    {
                      "profile": {
                        "name": "TEST USER"
                      },
                      "wa_id": "5511999999999"
                    }
                  ],
                  "messages": [
                    {
                      "from": "5511999999999",
                      "id": "wamid.test123456789",
                      "timestamp": String(Math.floor(Date.now() / 1000)),
                      "text": {
                        "body": "Esta é uma mensagem de teste"
                      },
                      "type": "text"
                    }
                  ]
                },
                "field": "messages"
              }
            ]
          }
        ]
      }),
    });

    const result = await response.json();
    
    return NextResponse.json({ 
      message: "Mensagem de teste enviada para o webhook", 
      webhookResponse: result 
    });
  } catch (error) {
    console.error("Erro ao testar webhook:", error);
    return NextResponse.json({ error: "Erro ao testar webhook" }, { status: 500 });
  }
} 