import { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { notFound } from "next/navigation"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Conversa | LeadManager",
  description: "Visualize a conversa do WhatsApp",
}

interface ConversaPageProps {
  params: {
    leadId: string
  }
}

async function getConversation(leadId: number) {
  const lead = await prisma.lead.findUnique({
    where: {
      id: leadId
    },
    include: {
      whatsappMessages: {
        orderBy: {
          timestamp: 'asc'
        }
      }
    }
  })

  if (!lead) {
    return null
  }

  return lead
}

export default async function ConversaPage({ params }: ConversaPageProps) {
  const leadId = parseInt(params.leadId)
  
  if (isNaN(leadId)) {
    notFound()
  }

  const conversation = await getConversation(leadId)

  if (!conversation) {
    notFound()
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link 
            href="/conversas" 
            className="text-sm text-muted-foreground hover:underline mb-2 inline-block"
          >
            ← Voltar para conversas
          </Link>
          <h1 className="text-2xl font-bold">Conversa com {conversation.name}</h1>
          <p className="text-muted-foreground">{conversation.phone}</p>
        </div>
      </div>

      <div className="bg-background rounded-lg border shadow-sm p-4 max-w-3xl mx-auto">
        <div className="space-y-4">
          {conversation.whatsappMessages.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma mensagem encontrada
            </p>
          ) : (
            conversation.whatsappMessages.map((message) => (
              <div 
                key={message.id} 
                className={`flex ${message.isFromMe ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.isFromMe 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                  }`}
                >
                  <p>{message.text}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {format(
                      new Date(message.timestamp),
                      "dd/MM/yyyy HH:mm",
                      { locale: ptBR }
                    )}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
} 