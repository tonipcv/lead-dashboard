import { PrismaClient as SQLitePrisma } from '@prisma/client'
import { PrismaClient as PostgresPrisma } from '@prisma/client'

async function migrateData() {
  // Cliente SQLite (antiga conexão)
  const sqliteClient = new SQLitePrisma({
    datasources: {
      db: {
        url: 'file:./dev.db'  // caminho do seu banco SQLite
      }
    }
  })

  // Cliente PostgreSQL (nova conexão)
  const postgresClient = new PostgresPrisma()

  try {
    // Buscar todos os leads do SQLite
    const leads = await sqliteClient.lead.findMany()
    console.log(`Encontrados ${leads.length} leads para migrar`)

    // Inserir leads no PostgreSQL
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
    }

    // Buscar configurações do WhatsApp
    const whatsappConfigs = await sqliteClient.whatsAppConfig.findMany()
    console.log(`Encontradas ${whatsappConfigs.length} configurações de WhatsApp para migrar`)

    // Inserir configurações do WhatsApp no PostgreSQL
    for (const config of whatsappConfigs) {
      await postgresClient.whatsAppConfig.create({
        data: {
          status: config.status,
          qrCode: config.qrCode,
          updatedAt: config.updatedAt
        }
      })
    }

    console.log('Migração concluída com sucesso!')
  } catch (error) {
    console.error('Erro durante a migração:', error)
  } finally {
    await sqliteClient.$disconnect()
    await postgresClient.$disconnect()
  }
}

migrateData() 