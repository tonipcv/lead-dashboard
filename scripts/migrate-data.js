const { PrismaClient: PostgresPrisma } = require('@prisma/client')
const { PrismaClient: SQLitePrisma } = require('../prisma/sqlite-client')

async function migrateData() {
  // Cliente SQLite (antiga conexão)
  const sqliteClient = new SQLitePrisma()

  // Cliente PostgreSQL (nova conexão)
  const postgresClient = new PostgresPrisma({
    datasources: {
      db: {
        url: "postgres://postgres:f6115fc0e2e5dd14fc6b@dpbdp1.easypanel.host:302/pessoal"
      }
    }
  })

  try {
    // Buscar todos os leads do SQLite
    console.log('Buscando leads do SQLite...')
    const leads = await sqliteClient.lead.findMany()
    console.log(`Encontrados ${leads.length} leads para migrar`)

    // Inserir leads no PostgreSQL
    console.log('Migrando leads para PostgreSQL...')
    for (const lead of leads) {
      await postgresClient.lead.create({
        data: {
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          source: lead.source,
          status: lead.status,
          createdAt: lead.createdAt
        }
      })
      console.log(`Lead ${lead.name} migrado com sucesso`)
    }

    // Buscar configurações do WhatsApp
    console.log('\nBuscando configurações do WhatsApp...')
    const whatsappConfigs = await sqliteClient.whatsAppConfig.findMany()
    console.log(`Encontradas ${whatsappConfigs.length} configurações de WhatsApp para migrar`)

    // Inserir configurações do WhatsApp no PostgreSQL
    console.log('Migrando configurações do WhatsApp...')
    for (const config of whatsappConfigs) {
      await postgresClient.whatsAppConfig.create({
        data: {
          status: config.status,
          qrCode: config.qrCode,
          updatedAt: config.updatedAt
        }
      })
      console.log('Configuração do WhatsApp migrada com sucesso')
    }

    console.log('\nMigração concluída com sucesso!')
  } catch (error) {
    console.error('Erro durante a migração:', error)
  } finally {
    await sqliteClient.$disconnect()
    await postgresClient.$disconnect()
  }
}

migrateData() 