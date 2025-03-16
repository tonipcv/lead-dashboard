-- Função para criar a tabela de forma segura
CREATE OR REPLACE FUNCTION create_email_templates_if_not_exists() RETURNS void AS $$
BEGIN
    -- Verifica se a tabela já existe
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
        
        -- Log da criação
        RAISE NOTICE 'Tabela email_templates criada com sucesso';
    ELSE
        RAISE NOTICE 'Tabela email_templates já existe, nenhuma ação necessária';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Executa a função
SELECT create_email_templates_if_not_exists(); 