const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Iniciando migração segura para modelos do Instagram...');
  
  try {
    // Ler o arquivo de migração
    const migrationPath = path.join(__dirname, '../prisma/migrations/instagram_models/migration.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Dividir em comandos SQL individuais
    const sqlCommands = migrationSQL
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0);
    
    // Executar cada comando SQL
    for (const sql of sqlCommands) {
      console.log(`🔹 Executando: ${sql.substring(0, 50)}...`);
      await prisma.$executeRawUnsafe(`${sql};`);
    }
    
    console.log('✅ Migração concluída com sucesso!');
  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 