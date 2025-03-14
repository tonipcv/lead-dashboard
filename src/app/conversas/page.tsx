import { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export const metadata: Metadata = {
  title: "Conversas | LeadManager",
  description: "Gerencie suas conversas do WhatsApp",
}

async function getConversations() {
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
  })

  return leadsWithMessages
}

export default async function ConversasPage() {
  const conversations = await getConversations()

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Conversas do WhatsApp</h1>
      </div>

      <div className="bg-background rounded-lg border shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="py-3 px-4 text-left font-medium">Nome</th>
                <th className="py-3 px-4 text-left font-medium">Telefone</th>
                <th className="py-3 px-4 text-left font-medium">Última mensagem</th>
                <th className="py-3 px-4 text-left font-medium">Data</th>
                <th className="py-3 px-4 text-left font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {conversations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-muted-foreground">
                    Nenhuma conversa encontrada
                  </td>
                </tr>
              ) : (
                conversations.map((lead) => {
                  const lastMessage = lead.whatsappMessages[0]
                  return (
                    <tr key={lead.id} className="border-b">
                      <td className="py-3 px-4">{lead.name}</td>
                      <td className="py-3 px-4">{lead.phone}</td>
                      <td className="py-3 px-4">
                        {lastMessage?.text.substring(0, 30)}
                        {lastMessage?.text.length > 30 ? "..." : ""}
                      </td>
                      <td className="py-3 px-4">
                        {lastMessage ? format(
                          new Date(lastMessage.timestamp),
                          "dd/MM/yyyy HH:mm",
                          { locale: ptBR }
                        ) : "-"}
                      </td>
                      <td className="py-3 px-4">
                        <a 
                          href={`/conversas/${lead.id}`}
                          className="text-primary hover:underline"
                        >
                          Ver conversa
                        </a>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
} 