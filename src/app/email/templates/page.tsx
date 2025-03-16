'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Template {
  id: number;
  name: string;
  subject: string;
  text?: string;
  html?: string;
}

const defaultTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Template</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      margin: 0;
      padding: 20px;
      color: #333;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: #fff;
      border-radius: 8px;
      padding: 20px;
    }
    .header {
      text-align: center;
      padding: 20px 0;
    }
    .content {
      padding: 20px 0;
    }
    .footer {
      text-align: center;
      padding: 20px 0;
      font-size: 12px;
      color: #666;
    }
    .button {
      display: inline-block;
      padding: 10px 20px;
      background-color: #007bff;
      color: white;
      text-decoration: none;
      border-radius: 5px;
      margin: 10px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>{{title}}</h1>
    </div>
    <div class="content">
      {{content}}
    </div>
    <div class="footer">
      <p>© 2024 Korax Labs. Todos os direitos reservados.</p>
    </div>
  </div>
</body>
</html>
`;

export default function EmailTemplatesPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    text: '',
    html: defaultTemplate,
  });
  const [previewContent, setPreviewContent] = useState('');

  // Função para atualizar a pré-visualização
  const updatePreview = () => {
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      
      if (doc) {
        doc.open();
        doc.write(formData.html || 'Sem conteúdo HTML');
        doc.close();
      }
    }
  };

  // Atualizar a pré-visualização quando o HTML mudar
  useEffect(() => {
    updatePreview();
  }, [formData.html]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/email/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Falha ao salvar o template');
      }

      const data = await response.json();

      toast({
        title: 'Template salvo com sucesso!',
        description: `O template "${formData.name}" foi criado.`,
        variant: 'default',
      });

      // Limpar o formulário mantendo o template padrão
      setFormData({
        name: '',
        subject: '',
        text: '',
        html: defaultTemplate,
      });

      // Atualizar a lista de templates
      router.refresh();
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar template',
        description: error.message || 'Ocorreu um erro ao salvar o template',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Templates de Email</h1>
        <Link href="/email">
          <Button variant="outline">Voltar para Emails</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <Tabs defaultValue="editor" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="editor">Editor</TabsTrigger>
              <TabsTrigger value="preview-text">Texto</TabsTrigger>
            </TabsList>

            <TabsContent value="editor">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Template</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Ex: Boas-vindas, Notificação, etc."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Assunto</Label>
                  <Input
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Assunto do email"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="text">Conteúdo em Texto</Label>
                  <Textarea
                    id="text"
                    name="text"
                    value={formData.text}
                    onChange={handleChange}
                    placeholder="Versão em texto simples do email"
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="html">Conteúdo HTML</Label>
                  <Textarea
                    id="html"
                    name="html"
                    value={formData.html}
                    onChange={handleChange}
                    placeholder="Versão HTML do email"
                    className="min-h-[200px] font-mono"
                  />
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? 'Salvando...' : 'Salvar Template'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="preview-text">
              <div className="border rounded p-4">
                <h3 className="font-bold mb-2">Pré-visualização em Texto</h3>
                <pre className="whitespace-pre-wrap bg-muted p-4 rounded">
                  {formData.text || 'Sem conteúdo em texto'}
                </pre>
              </div>
            </TabsContent>
          </Tabs>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Pré-visualização HTML</h2>
          <div className="border rounded bg-white">
            <iframe
              ref={iframeRef}
              className="w-full h-[600px] rounded"
              title="Preview"
              sandbox="allow-same-origin"
            />
          </div>
        </Card>
      </div>
    </div>
  );
} 