# Lead Dashboard

Um dashboard para gerenciamento de leads, com integrações para WhatsApp e Instagram.

## Funcionalidades

- Dashboard para visualização e gerenciamento de leads
- Integração com a API do WhatsApp para envio e recebimento de mensagens
- Integração com a API do Instagram para monitoramento de comentários, menções e mensagens
- Sistema de autenticação e autorização
- Estatísticas e relatórios

## Tecnologias

- [Next.js](https://nextjs.org) - Framework React para desenvolvimento web
- [Prisma](https://prisma.io) - ORM para acesso ao banco de dados
- [PostgreSQL](https://postgresql.org) - Banco de dados relacional
- [Tailwind CSS](https://tailwindcss.com) - Framework CSS para estilização
- [NextAuth.js](https://next-auth.js.org) - Autenticação para aplicações Next.js
- [WhatsApp Business API](https://developers.facebook.com/docs/whatsapp) - API para integração com WhatsApp
- [Instagram Graph API](https://developers.facebook.com/docs/instagram-api) - API para integração com Instagram

## Configuração

### Pré-requisitos

- Node.js 18 ou superior
- PostgreSQL
- Conta de desenvolvedor do Facebook
- Aplicativo do Facebook com produtos WhatsApp Business e Instagram Graph API configurados

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```
# Banco de Dados
DATABASE_URL="postgresql://usuario:senha@localhost:5432/lead_dashboard"

# WhatsApp API
WHATSAPP_API_VERSION=v18.0
WHATSAPP_API_URL=https://graph.facebook.com
WHATSAPP_PHONE_NUMBER_ID=seu_phone_number_id
WHATSAPP_ACCESS_TOKEN=seu_token_de_acesso

# Instagram API
INSTAGRAM_APP_ID=seu_app_id
INSTAGRAM_APP_SECRET=seu_app_secret
INSTAGRAM_VERIFY_TOKEN=seu_token_de_verificacao
INSTAGRAM_ACCESS_TOKEN=seu_token_de_acesso
INSTAGRAM_REDIRECT_URI=https://seu-dominio.com/api/instagram/auth/callback
WEBHOOK_URL=https://seu-dominio.com/api/instagram-webhook

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=seu_segredo_para_nextauth
```

### Instalação

1. Clone o repositório
   ```bash
   git clone https://github.com/seu-usuario/lead-dashboard.git
   cd lead-dashboard
   ```

2. Instale as dependências
   ```bash
   npm install
   ```

3. Execute as migrações do banco de dados
   ```bash
   npx prisma migrate dev
   ```

4. Inicie o servidor de desenvolvimento
   ```bash
   npm run dev
   ```

## Integrações

### WhatsApp

A integração com o WhatsApp permite enviar e receber mensagens através da API do WhatsApp Business. Para configurar:

1. Configure as variáveis de ambiente relacionadas ao WhatsApp
2. Acesse `/api/whatsapp/webhook` para configurar o webhook
3. Use os endpoints disponíveis para enviar mensagens:
   - `/api/whatsapp/send-text` - Enviar mensagem de texto
   - `/api/whatsapp/send` - Enviar mensagens com templates

Consulte a [documentação do WhatsApp Business API](https://developers.facebook.com/docs/whatsapp) para mais detalhes.

### Instagram

A integração com o Instagram permite monitorar comentários, menções e mensagens. Para configurar:

1. Configure as variáveis de ambiente relacionadas ao Instagram
2. Execute o script de migração para criar as tabelas necessárias:
   ```bash
   node scripts/apply-instagram-migration.js
   ```
3. Obtenha um token de acesso do Instagram:
   - Acesse `/api/instagram/auth` no navegador, ou
   - Execute `node scripts/get-instagram-token.js`
4. Configure o webhook:
   - Execute `node scripts/setup-instagram-webhook.js`, ou
   - Configure manualmente no Facebook Developer Dashboard

Para mais detalhes, consulte a documentação em `docs/instagram-setup.md`.

## Scripts Úteis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Compila o projeto para produção
- `npm start` - Inicia o servidor em modo de produção
- `node scripts/check-instagram-status.js` - Verifica o status da integração com o Instagram
- `node scripts/test-instagram-webhook.js` - Testa o webhook do Instagram

## Documentação

- `docs/instagram-setup.md` - Guia de configuração da integração com o Instagram
- `docs/instagram-webhook.md` - Detalhes sobre o webhook do Instagram

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para mais detalhes.
