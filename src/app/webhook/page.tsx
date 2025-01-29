import { Card } from "@/components/ui/card"

export default function WebhookPage() {
  const webhookUrl = "https://lead-dashboard-mauve.vercel.app/api/webhook/lead"
  
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Webhook Integration</h1>
      
      <div className="grid gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Configuração do Elementor</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">1. No seu formulário Elementor:</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Vá em "Actions After Submit"</li>
                <li>Adicione uma nova ação "Webhook"</li>
                <li>Configure o método como "POST"</li>
                <li>Configure o Content-Type como "application/json"</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-2">2. URL do Webhook:</h3>
              <code className="bg-secondary p-3 rounded block">
                {webhookUrl}
              </code>
            </div>

            <div>
              <h3 className="font-medium mb-2">3. Mapeamento dos Campos:</h3>
              <pre className="bg-secondary p-3 rounded">
{`{
  "name": "[field id='1']",
  "email": "[field id='2']",
  "phone": "[field id='3']"
}`}
              </pre>
              <p className="text-sm text-muted-foreground mt-2">
                Ajuste os IDs dos campos (field id) de acordo com seu formulário no Elementor
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Teste Manual</h2>
          <p className="mb-4">
            Copie e cole o comando abaixo no seu terminal para testar a integração:
          </p>
          <pre className="bg-secondary p-3 rounded text-sm overflow-x-auto">
{`curl -X POST \\
  ${webhookUrl} \\
  -H 'Content-Type: application/json' \\
  -d '{
  "name": "Lead Teste",
  "email": "teste@exemplo.com",
  "phone": "(11) 99999-9999"
}'`}
          </pre>
          <p className="text-sm text-muted-foreground mt-4">
            Ou se preferir, use este comando em uma linha só:
          </p>
          <pre className="bg-secondary p-3 rounded text-sm overflow-x-auto mt-2">
{`curl -X POST ${webhookUrl} -H 'Content-Type: application/json' -d '{"name":"Lead Teste","email":"teste@exemplo.com","phone":"(11) 99999-9999"}'`}
          </pre>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Resposta Esperada</h2>
          <pre className="bg-secondary p-3 rounded">
{`{
  "success": true,
  "message": "Lead criado com sucesso",
  "lead": {
    "id": 1,
    "name": "Lead Teste",
    "email": "teste@exemplo.com",
    "phone": "(11) 99999-9999",
    "source": "Elementor Form",
    "createdAt": "2024-03-21T10:00:00.000Z"
  }
}`}
          </pre>
        </Card>
      </div>
    </div>
  )
} 