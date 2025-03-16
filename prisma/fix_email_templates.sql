-- Drop a tabela antiga se existir (não vai dar erro se não existir)
DROP TABLE IF EXISTS "EmailTemplate";

-- Criar a nova tabela com o nome correto
CREATE TABLE IF NOT EXISTS "email_templates" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL UNIQUE,
    "subject" TEXT NOT NULL,
    "text" TEXT,
    "html" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
); 