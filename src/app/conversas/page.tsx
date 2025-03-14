import { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { MessageSquare, ArrowDownLeft, ArrowUpRight } from "lucide-react"
import { ConversationSidebar } from "@/components/conversation-sidebar"

export const metadata: Metadata = {
  title: "Conversas | LeadManager",
  description: "Gerencie suas conversas do WhatsApp",
}

async function getConversations() {
  console.log("🔍 Buscando conversas no banco de dados");
  
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

    console.log(`✅ Encontradas ${leadsWithMessages.length} conversas`);
    
    // Log detalhado para depuração
    if (leadsWithMessages.length > 0) {
      leadsWithMessages.forEach((lead, index) => {
        console.log(`📱 Conversa ${index + 1}:`);
        console.log(`   Lead: ${lead.id} - ${lead.name} (${lead.phone})`);
        console.log(`   Mensagens: ${lead.whatsappMessages.length}`);
        if (lead.whatsappMessages.length > 0) {
          const msg = lead.whatsappMessages[0];
          console.log(`   Última mensagem: ${msg.text.substring(0, 30)}...`);
        }
      });
    } else {
      console.log("⚠️ Nenhuma conversa encontrada");
      
      // Verificar se existem leads e mensagens separadamente
      const totalLeads = await prisma.lead.count();
      const totalMessages = await prisma.whatsAppMessage.count();
      
      console.log(`ℹ️ Total de leads no sistema: ${totalLeads}`);
      console.log(`ℹ️ Total de mensagens no sistema: ${totalMessages}`);
      
      if (totalMessages > 0) {
        console.log("🔍 Existem mensagens, mas podem não estar associadas a leads corretamente");
        
        // Buscar algumas mensagens para verificar
        const someMessages = await prisma.whatsAppMessage.findMany({
          take: 5,
          orderBy: {
            createdAt: 'desc'
          }
        });
        
        someMessages.forEach((msg, idx) => {
          console.log(`📝 Mensagem ${idx + 1}: ID=${msg.id}, LeadID=${msg.leadId || 'NULL'}, Texto=${msg.text.substring(0, 30)}`);
        });
      }
    }
    
    return leadsWithMessages;
  } catch (error) {
    console.error("❌ Erro ao buscar conversas:", error);
    return [];
  }
}

async function getMessageStats() {
  try {
    // Total de mensagens
    const totalMessages = await prisma.whatsAppMessage.count();
    
    // Mensagens enviadas (isFromMe = true)
    const sentMessages = await prisma.whatsAppMessage.count({
      where: {
        isFromMe: true
      }
    });
    
    // Mensagens recebidas (isFromMe = false)
    const receivedMessages = await prisma.whatsAppMessage.count({
      where: {
        isFromMe: false
      }
    });
    
    // Total de conversas (leads com pelo menos uma mensagem)
    const totalConversations = await prisma.lead.count({
      where: {
        whatsappMessages: {
          some: {}
        }
      }
    });
    
    // Média de mensagens por conversa
    const averageMessagesPerConversation = totalConversations > 0 
      ? Math.round((totalMessages / totalConversations) * 10) / 10 
      : 0;
    
    return {
      totalMessages,
      sentMessages,
      receivedMessages,
      totalConversations,
      averageMessagesPerConversation
    };
  } catch (error) {
    console.error("❌ Erro ao obter estatísticas de mensagens:", error);
    return {
      totalMessages: 0,
      sentMessages: 0,
      receivedMessages: 0,
      totalConversations: 0,
      averageMessagesPerConversation: 0
    };
  }
}

export default async function ConversasPage() {
  const conversations = await getConversations()
  const stats = await getMessageStats()

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar de conversas */}
      <ConversationSidebar conversations={conversations} />
      
      {/* Área principal */}
      <div className="flex-1 flex flex-col items-center justify-center bg-muted/20">
        <div className="text-center p-6 max-w-md">
          <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-20" />
          <h2 className="text-2xl font-semibold mb-4">Suas conversas do WhatsApp</h2>
          
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-primary/10 rounded-lg p-3 text-center">
              <p className="text-sm text-muted-foreground">Total de Mensagens</p>
              <p className="text-2xl font-bold text-primary">{stats.totalMessages}</p>
            </div>
            <div className="bg-primary/10 rounded-lg p-3 text-center">
              <p className="text-sm text-muted-foreground">Conversas</p>
              <p className="text-2xl font-bold text-primary">{stats.totalConversations}</p>
            </div>
            <div className="bg-primary/10 rounded-lg p-3 text-center flex flex-col items-center">
              <div className="flex items-center gap-1">
                <ArrowUpRight className="h-4 w-4 text-green-500" />
                <p className="text-sm text-muted-foreground">Enviadas</p>
              </div>
              <p className="text-xl font-bold text-primary">{stats.sentMessages}</p>
            </div>
            <div className="bg-primary/10 rounded-lg p-3 text-center flex flex-col items-center">
              <div className="flex items-center gap-1">
                <ArrowDownLeft className="h-4 w-4 text-blue-500" />
                <p className="text-sm text-muted-foreground">Recebidas</p>
              </div>
              <p className="text-xl font-bold text-primary">{stats.receivedMessages}</p>
            </div>
          </div>
          
          <p className="text-muted-foreground mb-6">
            Selecione uma conversa na barra lateral para visualizar as mensagens ou sincronize para buscar novas mensagens.
          </p>
        </div>
      </div>
    </div>
  )
} 