# Configuração da Integração com o Instagram

Este documento descreve como configurar a integração com o Instagram, incluindo a autenticação e o webhook para receber notificações em tempo real.

## Pré-requisitos

1. Uma conta de desenvolvedor do Facebook
2. Um aplicativo do Facebook com o produto Instagram Basic Display ou Instagram Graph API configurado
3. Uma conta comercial do Instagram conectada ao seu aplicativo
4. Um servidor acessível publicamente para receber as notificações do webhook

## Passos para Configuração

### 1. Configurar o Ambiente

Adicione as seguintes variáveis ao seu arquivo `.env`:

```
INSTAGRAM_APP_ID=2576913712507077
INSTAGRAM_APP_SECRET=71df1811f8c5f77d30012c470e2bf46c
INSTAGRAM_VERIFY_TOKEN=H34g+PDCOI2Vi2ilavlhEsHYCRSeF19bMLUhC0OZ8Rs=
INSTAGRAM_ACCESS_TOKEN=IGAAknsHpzaMVBZAE54YlVrT0lBWm9QUUR5VXdERXlGeU45VG5yZAThmQnN0T2c1d1IydEpGRDZAUTXNZARG9yMWRPTjhnM1JkTUZAQUHJaYy1maE51YlB4TGxLLUFRMjBVVEItaUJPaGRlVWNuTFMzRWJjQVdkakxNSHFHQVN2V2VRYwZDZD
WEBHOOK_URL=https://seu-dominio.com/api/instagram-webhook
```

Substitua `https://seu-dominio.com` pelo domínio do seu servidor.

### 2. Aplicar a Migração do Banco de Dados

Execute o script de migração para criar as tabelas necessárias no banco de dados:

```bash
node scripts/apply-instagram-migration.js
```

### 3. Autenticar com o Instagram

Existem duas maneiras de autenticar com o Instagram:

#### Opção 1: Usando o endpoint de autenticação

1. Acesse `https://seu-dominio.com/api/instagram/auth` no navegador
2. Faça login com sua conta do Instagram e autorize o aplicativo
3. Você será redirecionado para a página de callback, que salvará automaticamente o token de acesso

#### Opção 2: Usando o script de autenticação

1. Execute o script sem argumentos para ver as instruções:
   ```bash
   node scripts/get-instagram-token.js
   ```
2. Siga as instruções para obter um código de autorização
3. Execute o script novamente com o código de autorização:
   ```bash
   node scripts/get-instagram-token.js CODIGO_DE_AUTORIZACAO
   ```
4. Adicione o token de acesso ao seu arquivo `.env`

### 4. Configurar o Webhook

#### Opção 1: Configuração manual no Facebook Developer Dashboard

1. Acesse o [Facebook Developer Dashboard](https://developers.facebook.com/)
2. Selecione seu aplicativo
3. Vá para "Produtos" > "Webhooks" > "Adicionar produto"
4. Selecione "Instagram"
5. Configure o webhook com as seguintes informações:
   - URL de Callback: `https://seu-dominio.com/api/instagram-webhook`
   - Token de Verificação: `H34g+PDCOI2Vi2ilavlhEsHYCRSeF19bMLUhC0OZ8Rs=` (ou o valor definido em `INSTAGRAM_VERIFY_TOKEN`)
   - Campos: `comments`, `mentions`, `messages`, `story_insights`
6. Clique em "Verificar e Salvar"

#### Opção 2: Configuração automática usando o script

Execute o script de configuração do webhook:

```bash
node scripts/setup-instagram-webhook.js
```

### 5. Assinar a Conta do Instagram para Receber Notificações

Para receber notificações, você precisa assinar sua conta do Instagram para os campos desejados:

```bash
curl -X POST \
  "https://graph.instagram.com/v18.0/me/subscribed_apps?access_token=IGAAknsHpzaMVBZAE54YlVrT0lBWm9QUUR5VXdERXlGeU45VG5yZAThmQnN0T2c1d1IydEpGRDZAUTXNZARG9yMWRPTjhnM1JkTUZAQUHJaYy1maE51YlB4TGxLLUFRMjBVVEItaUJPaGRlVWNuTFMzRWJjQVdkakxNSHFHQVN2V2VRYwZDZD&subscribed_fields=comments,mentions,messages,story_insights"
```

## Estrutura de Arquivos

- `src/app/api/instagram-webhook/route.ts`: Endpoint para receber notificações do webhook
- `src/app/api/instagram/auth/route.ts`: Endpoint para iniciar o processo de autenticação
- `src/app/api/instagram/auth/callback/route.ts`: Endpoint para o callback de autenticação
- `scripts/apply-instagram-migration.js`: Script para aplicar a migração do banco de dados
- `scripts/get-instagram-token.js`: Script para obter um token de acesso
- `scripts/setup-instagram-webhook.js`: Script para configurar o webhook
- `docs/instagram-webhook.md`: Documentação detalhada sobre o webhook
- `docs/instagram-setup.md`: Este documento

## Testando a Integração

### Testando a Autenticação

1. Acesse `https://seu-dominio.com/api/instagram/auth` no navegador
2. Verifique se você é redirecionado para a página de login do Instagram
3. Após autorizar, verifique se você é redirecionado para a página de callback
4. Verifique se o token de acesso é salvo no banco de dados

### Testando o Webhook

1. No Facebook Developer Dashboard, vá para "Produtos" > "Webhooks"
2. Clique no botão "Test" ao lado do campo que deseja testar
3. Selecione uma opção de teste e clique em "Send to My Server"
4. Verifique os logs do servidor para confirmar que a notificação foi recebida

## Solução de Problemas

### Problemas de Autenticação

- Verifique se o ID do aplicativo e o segredo estão corretos
- Verifique se a URL de redirecionamento está configurada corretamente no aplicativo
- Verifique se a conta do Instagram está conectada ao aplicativo

### Problemas com o Webhook

- Verifique se o servidor está acessível publicamente
- Verifique se o token de verificação está configurado corretamente
- Verifique os logs do servidor para identificar possíveis erros
- Certifique-se de que o aplicativo tem as permissões necessárias

## Referências

- [Documentação oficial do Instagram Graph API](https://developers.facebook.com/docs/instagram-api)
- [Documentação de Webhooks do Facebook](https://developers.facebook.com/docs/graph-api/webhooks) 