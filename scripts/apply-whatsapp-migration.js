const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Verificando se a tabela WhatsAppMessage já existe...');
  
  try {
    // Tentar consultar a tabela para ver se ela existe
    await prisma.$queryRaw`SELECT 1 FROM "WhatsAppMessage" LIMIT 1`;
    console.log('✅ A tabela WhatsAppMessage já existe no banco de dados.');
    return;
  } catch (error) {
    // Se der erro, a tabela não existe e precisamos criá-la
    console.log('🆕 A tabela WhatsAppMessage não existe. Criando...');
    
    try {
      // Ler o arquivo de migração
      const migrationPath = path.join(__dirname, '../prisma/migrations/add_whatsapp_messages/migration.sql');
      const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
      
      // Dividir as consultas SQL
      const queries = migrationSQL
        .split(';')
        .map(query => query.trim())
        .filter(query => query.length > 0);
      
      // Executar cada consulta separadamente
      for (const query of queries) {
        console.log(`🔄 Executando: ${query.substring(0, 100)}...`);
        await prisma.$executeRawUnsafe(`${query};`);
      }
      
      console.log('✅ Migração aplicada com sucesso!');
    } catch (migrationError) {
      console.error('❌ Erro ao aplicar migração:', migrationError);
    }
  }
}

main()
  .catch(e => {
    console.error('❌ Erro:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 