-- Primeiro, verificamos se a tabela já existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename = 'email_templates'
    ) THEN
        -- Criar a tabela apenas se ela não existir
        CREATE TABLE "email_templates" (
            "id" SERIAL PRIMARY KEY,
            "name" TEXT NOT NULL UNIQUE,
            "subject" TEXT NOT NULL,
            "text" TEXT,
            "html" TEXT,
            "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updated_at" TIMESTAMP(3) NOT NULL
        );
    END IF;
END $$; 