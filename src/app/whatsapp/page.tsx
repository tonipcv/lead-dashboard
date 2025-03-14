"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function WhatsAppPage() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const { toast } = useToast()

  const handleSendMessages = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/sendMessage', {
        method: 'POST',
      })
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao enviar mensagens')
      }

      setResults(data.results)
      toast({
        title: "Sucesso!",
        description: `${data.results.success} mensagens enviadas com sucesso.`,
      })
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Envio de Mensagens WhatsApp</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Enviar Mensagem em Massa</CardTitle>
            <CardDescription>
              Envie mensagens para todos os contatos ativos usando o template "marco_antecipacao"
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleSendMessages}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Enviar Mensagens
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {results && (
          <Card>
            <CardHeader>
              <CardTitle>Resultados do Envio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <p className="text-sm text-green-600 dark:text-green-400">Enviadas com Sucesso</p>
                    <p className="text-2xl font-bold">{results.success}</p>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400">Falhas no Envio</p>
                    <p className="text-2xl font-bold">{results.failed}</p>
                  </div>
                </div>

                {results.errors.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Detalhes dos Erros</h3>
                    <div className="bg-background rounded-lg border p-4 max-h-60 overflow-y-auto">
                      {results.errors.map((error: any, index: number) => (
                        <div key={index} className="mb-2 last:mb-0">
                          <p className="text-sm">
                            <span className="font-medium">Telefone:</span> {error.phone}
                          </p>
                          <p className="text-sm text-red-600 dark:text-red-400">
                            {error.error}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 