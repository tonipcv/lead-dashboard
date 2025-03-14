import { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { notFound } from "next/navigation"
import { MessageInput } from "@/components/message-input"
import { ConversationSidebar } from "@/components/conversation-sidebar"

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

async function getConversations() {
  try {
    // Buscar leads que têm mensagens do WhatsApp
    const leadsWithMessages = await prisma.lead.findMany({
      where: {
        whatsappMessages: {
          some: {}
        }
      },
      include: {
        whatsappMessages: {
          orderBy: {
            timestamp: 'desc'
          },
          take: 1
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return leadsWithMessages;
  } catch (error) {
    console.error("❌ Erro ao buscar conversas:", error);
    return [];
  }
}

export default async function ConversaPage({ params }: ConversaPageProps) {
  const leadId = parseInt(params.leadId)
  
  if (isNaN(leadId)) {
    notFound()
  }

  const conversation = await getConversation(leadId)
  const conversations = await getConversations()

  if (!conversation) {
    notFound()
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar de conversas */}
      <ConversationSidebar conversations={conversations} />
      
      {/* Área de conversa */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b p-4 flex items-center gap-3">
          <div className="flex-1">
            <h1 className="font-semibold text-xl">{conversation.name}</h1>
            <p className="text-base font-medium text-primary">{conversation.phone}</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {conversation.whatsappMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <p>Nenhuma mensagem encontrada</p>
            </div>
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

        {/* Message Input */}
        <MessageInput leadId={leadId} />
      </div>
    </div>
  )
} 