'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy } from 'lucide-react'

export default function WebhooksPage() {
  const [webhookUrl, setWebhookUrl] = useState('')

  useEffect(() => {
    const baseUrl = window.location.origin
    setWebhookUrl(`${baseUrl}/api/webhook/lead`)
  }, [])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="p-4 md:p-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Webhook para Integração de Leads</CardTitle>
          <CardDescription>
            Escolha o método de integração e siga as instruções
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 mb-6">
            <label className="text-sm font-medium">URL do Webhook</label>
            <div className="flex gap-2">
              <Input value={webhookUrl} readOnly />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(webhookUrl)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Tabs defaultValue="elementor">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="elementor">Elementor Form</TabsTrigger>
              <TabsTrigger value="custom">Custom Integration</TabsTrigger>
            </TabsList>

            <TabsContent value="elementor" className="space-y-4 mt-4">
              <Alert>
                <AlertDescription>
                  <div className="space-y-4">
                    <p className="font-medium">Como configurar no Elementor:</p>
                    <ol className="list-decimal list-inside space-y-2">
                      <li>No editor do Elementor, edite seu formulário</li>
                      <li>Vá para a aba "Ações após envio"</li>
                      <li>Adicione uma nova ação do tipo "Webhook"</li>
                      <li>Cole a URL do webhook acima no campo "URL do Webhook"</li>
                      <li>Configure os IDs dos campos do seu formulário:
                        <ul className="ml-6 mt-2 list-disc space-y-1">
                          <li>field_1: Campo de Nome</li>
                          <li>field_2: Campo de Email</li>
                          <li>field_3: Campo de Telefone</li>
                        </ul>
                      </li>
                    </ol>
                  </div>
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="custom" className="space-y-4 mt-4">
              <Alert>
                <AlertDescription>
                  <p className="font-medium mb-2">Método POST:</p>
                  <pre className="mt-2 p-4 bg-muted rounded-md overflow-x-auto">
{`fetch('${webhookUrl}', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Nome do Lead',
    email: 'email@exemplo.com',
    phone: '(11) 99999-9999',
    source: 'custom-form'  // opcional
  })
})`}
                  </pre>
                </AlertDescription>
              </Alert>

              <Alert>
                <AlertDescription>
                  <p className="font-medium mb-2">Exemplo com HTML Form:</p>
                  <pre className="mt-2 p-4 bg-muted rounded-md overflow-x-auto">
{`<form id="leadForm">
  <input type="text" name="name" required>
  <input type="email" name="email" required>
  <input type="tel" name="phone" required>
  <button type="submit">Enviar</button>
</form>

<script>
document.getElementById('leadForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  
  try {
    const response = await fetch('${webhookUrl}', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        source: 'custom-form'
      })
    });

    if (response.ok) {
      alert('Lead cadastrado com sucesso!');
      e.target.reset();
    } else {
      alert('Erro ao cadastrar lead');
    }
  } catch (error) {
    console.error('Erro:', error);
    alert('Erro ao enviar formulário');
  }
});
</script>`}
                  </pre>
                </AlertDescription>
              </Alert>

              <Alert>
                <AlertDescription>
                  <p className="font-medium mb-2">Resposta do Webhook:</p>
                  <pre className="mt-2 p-4 bg-muted rounded-md overflow-x-auto">
{`// Sucesso (201)
{
  "success": true,
  "message": "Lead criado com sucesso",
  "lead": {
    "id": 1,
    "name": "Nome do Lead",
    "email": "email@exemplo.com",
    "phone": "(11) 99999-9999",
    "source": "custom-form",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}

// Erro (400)
{
  "error": "Campos obrigatórios faltando",
  "required": ["name", "email", "phone"]
}`}
                  </pre>
                </AlertDescription>
              </Alert>

              <Alert>
                <AlertDescription>
                  <p className="font-medium mb-2">Teste via cURL (Terminal):</p>
                  <pre className="mt-2 p-4 bg-muted rounded-md overflow-x-auto">
{`curl -X POST ${webhookUrl} -H "Content-Type: application/json" -d '{"name":"Nome do Lead","email":"email@exemplo.com","phone":"(11) 99999-9999","source":"custom-form"}'`}
                  </pre>
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
} 