'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageSquare, Phone, RefreshCw } from 'lucide-react'

export default function WhatsApp() {
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'loading'>('loading')
  const [qrCode, setQrCode] = useState<string | null>(null)

  const checkStatus = async () => {
    try {
      const response = await fetch('/api/whatsapp/status')
      if (!response.ok) throw new Error('Erro ao verificar status')
      
      const data = await response.json()
      setStatus(data.status)
      setQrCode(data.qrCode)
    } catch (error) {
      console.error('Erro ao verificar status:', error)
      setStatus('disconnected')
    }
  }

  useEffect(() => {
    checkStatus()
    // Verificar status a cada 30 segundos
    const interval = setInterval(checkStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="p-4 md:p-8 space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center gap-2">
              <MessageSquare className="w-6 h-6" />
              WhatsApp
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={checkStatus}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar Status
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                status === 'connected' ? 'bg-green-500' :
                status === 'disconnected' ? 'bg-red-500' :
                'bg-yellow-500 animate-pulse'
              }`} />
              <span className="font-medium">
                {status === 'connected' ? 'Conectado' :
                 status === 'disconnected' ? 'Desconectado' :
                 'Verificando...'}
              </span>
            </div>

            {status === 'connected' && (
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <p className="text-green-700 dark:text-green-300 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  WhatsApp está pronto para uso
                </p>
              </div>
            )}

            {status === 'disconnected' && (
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                <p className="text-red-700 dark:text-red-300">
                  WhatsApp não está conectado. Por favor, escaneie o QR Code quando disponível.
                </p>
              </div>
            )}

            {qrCode && (
              <div className="flex justify-center p-4 bg-white rounded-lg">
                <img 
                  src={qrCode} 
                  alt="QR Code para conexão do WhatsApp" 
                  className="w-64 h-64"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 