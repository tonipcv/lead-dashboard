"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, Search, Phone, RefreshCw, Loader2 } from 'lucide-react'

interface Message {
  id: string
  from: string
  text: string
  timestamp: string
  type: 'sent' | 'received'
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [phoneFilter, setPhoneFilter] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  const fetchMessages = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/whatsapp/messages')
      const data = await response.json()
      setMessages(data.messages || [])
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchMessages()
    setRefreshing(false)
  }

  useEffect(() => {
    fetchMessages()
  }, [])

  const filteredMessages = messages.filter(message =>
    !phoneFilter || message.from.includes(phoneFilter)
  )

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-teal-500" />
            Histórico de Conversas
          </CardTitle>
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
              <Input
                placeholder="Buscar por telefone..."
                value={phoneFilter}
                onChange={(e) => setPhoneFilter(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={refreshing}
              className="shrink-0"
            >
              {refreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma mensagem encontrada</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-4 p-4 rounded-lg ${
                    message.type === 'sent'
                      ? 'bg-teal-50 dark:bg-teal-900/30 ml-auto'
                      : 'bg-gray-50 dark:bg-gray-900/30'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium">{message.from}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(message.timestamp).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <p className="text-sm">{message.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 