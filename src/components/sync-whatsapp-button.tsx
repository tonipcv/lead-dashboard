'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { RefreshCw, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export function SyncWhatsAppButton() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSync = async () => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/whatsapp/sync')
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "Sincronização concluída",
          description: `${data.results.saved} mensagens sincronizadas, ${data.results.skipped} ignoradas.`,
          variant: "default",
        })
      } else {
        toast({
          title: "Erro na sincronização",
          description: data.error || "Ocorreu um erro ao sincronizar as mensagens.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro na sincronização",
        description: "Não foi possível conectar ao servidor.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button 
      onClick={handleSync} 
      disabled={isLoading}
      className="flex items-center gap-2"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <RefreshCw className="h-4 w-4" />
      )}
      {isLoading ? "Sincronizando..." : "Sincronizar Mensagens"}
    </Button>
  )
} 