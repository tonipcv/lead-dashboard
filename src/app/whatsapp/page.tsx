'use client'

import { useEffect, useState } from 'react'
import * as QRCode from 'qrcode'

export default function WhatsAppPage() {
  const [status, setStatus] = useState<string>('disconnected')
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const initializeWhatsApp = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/whatsapp/init', { method: 'POST' })
      if (!response.ok) {
        throw new Error('Falha ao inicializar WhatsApp')
      }
      checkQRCode()
    } catch (error) {
      console.error('Erro ao inicializar WhatsApp:', error)
      setError('Falha ao inicializar WhatsApp. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const checkQRCode = async () => {
    try {
      const response = await fetch('/api/whatsapp/qrcode')
      const data = await response.json()
      console.log('QR Code response:', data)
      setQrCode(data.qrCode)
      if (data.qrCode) {
        const dataUrl = await QRCode.toDataURL(data.qrCode, {
          width: 256,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#ffffff'
          }
        })
        setQrCodeDataUrl(dataUrl)
      }
    } catch (error) {
      console.error('Erro ao buscar QR code:', error)
      setError('Falha ao buscar QR code')
    }
  }

  const checkStatus = async () => {
    try {
      const response = await fetch('/api/whatsapp/status')
      const data = await response.json()
      setStatus(data.status)
    } catch (error) {
      console.error('Erro ao verificar status:', error)
    }
  }

  useEffect(() => {
    checkStatus()
    
    const interval = setInterval(() => {
      checkStatus()
      if (status === 'disconnected') {
        checkQRCode()
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [status])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto py-16 px-4">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-8 text-center">
            Conexão WhatsApp
          </h1>
          
          <div className="flex flex-col items-center space-y-6">
            <div className="text-gray-700">
              Status: <span className="font-medium">{status}</span>
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 p-4 rounded-md">
                {error}
              </div>
            )}

            {status === 'disconnected' && !loading && (
              <button
                onClick={initializeWhatsApp}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                disabled={loading}
              >
                {loading ? 'Conectando...' : 'Conectar WhatsApp'}
              </button>
            )}

            {loading && (
              <div className="text-gray-500">
                Inicializando WhatsApp...
              </div>
            )}

            {qrCode && status === 'disconnected' && qrCodeDataUrl && (
              <div className="p-4 bg-white border rounded-lg shadow-sm">
                <img 
                  src={qrCodeDataUrl} 
                  alt="QR Code" 
                  width={256} 
                  height={256}
                  className="w-64 h-64"
                />
                <p className="mt-4 text-sm text-gray-500 text-center">
                  Escaneie o QR Code com seu WhatsApp
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 