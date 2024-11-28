import { Client } from 'whatsapp-web.js'
import { prisma } from './prisma'

class WhatsAppService {
  private client: Client
  private static instance: WhatsAppService

  private constructor() {
    this.client = new Client({})

    this.client.on('qr', async (qr) => {
      await prisma.whatsAppConfig.upsert({
        where: { id: 1 },
        update: { qrCode: qr, status: 'pending' },
        create: { qrCode: qr, status: 'pending' }
      })
    })

    this.client.on('ready', async () => {
      await prisma.whatsAppConfig.update({
        where: { id: 1 },
        data: { status: 'connected', qrCode: null }
      })
    })

    this.client.initialize()
  }

  public static getInstance(): WhatsAppService {
    if (!WhatsAppService.instance) {
      WhatsAppService.instance = new WhatsAppService()
    }
    return WhatsAppService.instance
  }

  public async sendMessage(phone: string, message: string) {
    try {
      const formattedPhone = phone.replace(/\D/g, '')
      await this.client.sendMessage(`${formattedPhone}@c.us`, message)
      return true
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      return false
    }
  }
}

export const whatsappService = WhatsAppService.getInstance() 