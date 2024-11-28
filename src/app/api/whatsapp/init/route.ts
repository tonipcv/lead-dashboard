import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Client, LocalAuth } from 'whatsapp-web.js'
import { chromium } from 'playwright'

let client: Client | null = null

export async function POST() {
  try {
    console.log('Iniciando cliente WhatsApp...')
    
    if (client) {
      await client.destroy()
      client = null
    }
    
    // Inicia o browser com Playwright
    const browser = await chromium.launch({
      headless: true
    })

    client = new Client({
      authStrategy: new LocalAuth({
        clientId: 'lead-dashboard',
        dataPath: './whatsapp-auth'
      }),
      puppeteer: {
        browserWSEndpoint: browser.wsEndpoint()
      }
    })

    console.log('Cliente criado, configurando eventos...')

    client.on('qr', async (qr) => {
      console.log('QR Code gerado:', qr.substring(0, 50) + '...')
      try {
        await prisma.whatsAppConfig.upsert({
          where: { id: 1 },
          update: {
            qrCode: qr,
            status: 'disconnected'
          },
          create: {
            qrCode: qr,
            status: 'disconnected'
          }
        })
        console.log('QR Code salvo no banco')
      } catch (error) {
        console.error('Erro ao salvar QR code:', error)
      }
    })

    client.on('ready', async () => {
      console.log('Cliente WhatsApp pronto!')
      try {
        await prisma.whatsAppConfig.upsert({
          where: { id: 1 },
          update: {
            status: 'connected',
            qrCode: null
          },
          create: {
            status: 'connected',
            qrCode: null
          }
        })
      } catch (error) {
        console.error('Erro ao atualizar status:', error)
      }
    })

    client.on('auth_failure', async (msg) => {
      console.error('Falha na autenticação:', msg)
      try {
        await prisma.whatsAppConfig.upsert({
          where: { id: 1 },
          update: {
            status: 'disconnected',
            qrCode: null
          },
          create: {
            status: 'disconnected',
            qrCode: null
          }
        })
      } catch (error) {
        console.error('Erro ao atualizar status após falha:', error)
      }
    })

    client.on('disconnected', async (reason) => {
      console.log('Cliente desconectado:', reason)
      try {
        await prisma.whatsAppConfig.upsert({
          where: { id: 1 },
          update: {
            status: 'disconnected',
            qrCode: null
          },
          create: {
            status: 'disconnected',
            qrCode: null
          }
        })
      } catch (error) {
        console.error('Erro ao atualizar status após desconexão:', error)
      }
    })

    console.log('Inicializando cliente...')
    await client.initialize()
    console.log('Cliente inicializado com sucesso')

    return NextResponse.json({ message: 'Iniciando WhatsApp...' })
  } catch (error) {
    console.error('Erro ao inicializar WhatsApp:', error)
    try {
      await prisma.whatsAppConfig.upsert({
        where: { id: 1 },
        update: {
          status: 'disconnected',
          qrCode: null
        },
        create: {
          status: 'disconnected',
          qrCode: null
        }
      })
    } catch (dbError) {
      console.error('Erro ao limpar estado:', dbError)
    }
    
    return NextResponse.json(
      { error: 'Erro ao inicializar WhatsApp' },
      { status: 500 }
    )
  }
} 