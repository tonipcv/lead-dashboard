'use client'

import { useState } from 'react'
import Link from 'next/link'
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { MessageSquare, Search, User } from "lucide-react"
import { Input } from "@/components/ui/input"
import { SyncWhatsAppButton } from "@/components/sync-whatsapp-button"
import { usePathname } from 'next/navigation'

interface Conversation {
  id: number
  name: string
  phone: string
  whatsappMessages: {
    id: number
    text: string
    timestamp: Date
  }[]
}

interface ConversationSidebarProps {
  conversations: Conversation[]
}

export function ConversationSidebar({ conversations }: ConversationSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const pathname = usePathname()
  const pathParts = pathname ? pathname.split('/') : []
  const currentLeadId = pathParts.length > 0 ? pathParts[pathParts.length - 1] : ''
  
  // Filter conversations based on search query
  const filteredConversations = conversations.filter(lead => 
    lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.phone.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="w-80 border-r flex flex-col h-full">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="font-semibold text-lg">Conversas</h2>
        <SyncWhatsAppButton />
      </div>
      
      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar conversa..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            {searchQuery ? (
              <>
                <p>Nenhum resultado encontrado</p>
                <p className="text-sm mt-1">Tente outro termo de busca</p>
              </>
            ) : (
              <>
                <MessageSquare className="h-12 w-12 mb-2 opacity-20" />
                <p>Nenhuma conversa encontrada</p>
              </>
            )}
          </div>
        ) : (
          <div className="divide-y">
            {filteredConversations.map((lead) => {
              const lastMessage = lead.whatsappMessages[0]
              const isActive = lead.id.toString() === currentLeadId
              
              return (
                <Link 
                  key={lead.id}
                  href={`/conversas/${lead.id}`}
                  className={`block p-3 transition-colors ${
                    isActive ? 'bg-primary/10' : 'hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`rounded-full p-2 mt-1 ${
                      isActive ? 'bg-primary/20' : 'bg-primary/10'
                    }`}>
                      <User className={`h-5 w-5 ${
                        isActive ? 'text-primary' : 'text-primary/80'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <h3 className={`font-medium truncate ${
                          isActive ? 'text-primary' : ''
                        }`}>
                          {lead.name}
                        </h3>
                        {lastMessage && (
                          <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                            {format(
                              new Date(lastMessage.timestamp),
                              "dd/MM HH:mm",
                              { locale: ptBR }
                            )}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {lastMessage?.text || "Sem mensagens"}
                      </p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
} 