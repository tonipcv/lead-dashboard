'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface MessageInputProps {
  leadId: number
}

export function MessageInput({ leadId }: MessageInputProps) {
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const { toast } = useToast()

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!message.trim()) return
    
    setIsSending(true)
    
    try {
      const response = await fetch('/api/whatsapp/send-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leadId,
          text: message
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        setMessage('')
        // Optionally refresh the conversation to show the new message
        window.location.reload()
      } else {
        toast({
          title: "Erro ao enviar mensagem",
          description: data.error || "Ocorreu um erro ao enviar a mensagem.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro ao enviar mensagem",
        description: "Não foi possível conectar ao servidor.",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="border-t p-3">
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Digite uma mensagem..."
          disabled={isSending}
          className="flex-1"
        />
        <Button 
          type="submit" 
          size="icon" 
          disabled={isSending || !message.trim()}
        >
          {isSending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  )
} 