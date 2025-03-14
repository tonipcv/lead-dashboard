import { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { MessageSquare } from "lucide-react"
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

export default async function ConversasPage() {
  const conversations = await getConversations()

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar de conversas */}
      <ConversationSidebar conversations={conversations} />
      
      {/* Área principal */}
      <div className="flex-1 flex flex-col items-center justify-center bg-muted/20">
        <div className="text-center p-6 max-w-md">
          <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-20" />
          <h2 className="text-2xl font-semibold mb-2">Suas conversas do WhatsApp</h2>
          <p className="text-muted-foreground mb-6">
            Selecione uma conversa na barra lateral para visualizar as mensagens ou sincronize para buscar novas mensagens.
          </p>
        </div>
      </div>
    </div>
  )
} 