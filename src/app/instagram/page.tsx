'use client'

import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Instagram, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"

interface InstagramConfig {
  id: number
  status: string
  username: string | null
  accessToken: string | null
  updatedAt: string
}

export default function InstagramPage() {
  const { toast } = useToast()
  const [config, setConfig] = useState<InstagramConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/instagram/config')
      if (response.ok) {
        const data = await response.json()
        setConfig(data)
      }
    } catch (error) {
      console.error('Erro ao buscar configuração:', error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar a configuração do Instagram.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleConnect = () => {
    window.location.href = '/api/instagram/auth'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Instagram</h1>
          <p className="text-muted-foreground">
            Gerencie sua integração com o Instagram
          </p>
        </div>
      </div>

      <div className="grid gap-8">
        {/* Status da Conexão */}
        <Card>
          <CardHeader>
            <CardTitle>Status da Conexão</CardTitle>
            <CardDescription>
              Status atual da conexão com sua conta do Instagram
            </CardDescription>
          </CardHeader>
          <CardContent>
            {config ? (
              <div className="space-y-4">
                <Alert variant={config.status === 'connected' ? 'default' : 'destructive'}>
                  {config.status === 'connected' ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      <AlertTitle>Conectado</AlertTitle>
                      <AlertDescription>
                        Conectado como @{config.username}
                      </AlertDescription>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Desconectado</AlertTitle>
                      <AlertDescription>
                        Clique no botão abaixo para conectar sua conta do Instagram
                      </AlertDescription>
                    </>
                  )}
                </Alert>

                {config.status === 'connected' ? (
                  <div className="flex items-center gap-4">
                    <Button variant="outline" onClick={handleConnect}>
                      Reconectar
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      Última atualização: {new Date(config.updatedAt).toLocaleString()}
                    </p>
                  </div>
                ) : (
                  <Button onClick={handleConnect}>
                    <Instagram className="mr-2 h-4 w-4" />
                    Conectar Instagram
                  </Button>
                )}
              </div>
            ) : (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erro</AlertTitle>
                <AlertDescription>
                  Não foi possível carregar a configuração do Instagram
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Webhooks */}
        <Card>
          <CardHeader>
            <CardTitle>Webhooks</CardTitle>
            <CardDescription>
              Configuração dos webhooks para receber notificações do Instagram
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>URL do Webhook</AlertTitle>
                <AlertDescription>
                  https://lead-dashboard-mauve.vercel.app/api/instagram-webhook
                </AlertDescription>
              </Alert>

              <div className="grid gap-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Comentários</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Menções</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Mensagens</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Insights de Stories</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 