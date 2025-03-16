'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Check, ChevronsUpDown } from "lucide-react";
import Link from 'next/link';
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { MultiSelect } from "@/components/ui/multi-select";

interface Template {
  id: number;
  name: string;
  subject: string;
  text?: string;
  html?: string;
}

interface Lead {
  id: number;
  email: string;
  source: string;
}

export default function EmailPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [excludedSources, setExcludedSources] = useState<string[]>([]);
  const [availableSources, setAvailableSources] = useState<string[]>([]);
  const [manualEmails, setManualEmails] = useState('');
  const [formData, setFormData] = useState({
    to: '',
    subject: '',
    text: '',
    html: '',
    useHtml: false
  });

  // Carregar templates e leads ao montar o componente
  useEffect(() => {
    const loadData = async () => {
      try {
        // Carregar templates
        const templatesResponse = await fetch('/api/email/templates');
        if (templatesResponse.ok) {
          const templatesData = await templatesResponse.json();
          setTemplates(templatesData);
        }

        // Carregar leads (todos de uma vez)
        const leadsResponse = await fetch('/api/leads?pageSize=10000');
        if (leadsResponse.ok) {
          const leadsData = await leadsResponse.json();
          setLeads(leadsData.leads);
        }

        // Carregar origens disponíveis
        const sourcesResponse = await fetch('/api/leads/sources');
        if (sourcesResponse.ok) {
          const sourcesData = await sourcesResponse.json();
          setAvailableSources(sourcesData.sources);
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    };

    loadData();
  }, []);

  // Atualizar lista de emails quando as seleções mudarem
  useEffect(() => {
    if (!Array.isArray(leads)) return;

    const normalizeString = (str: string) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    const filteredLeads = leads.filter((lead: Lead) => {
      const normalizedLeadSource = normalizeString(lead.source);
      const sourceIncluded = selectedSources.length === 0 || 
        selectedSources.some(source => normalizeString(source) === normalizedLeadSource);
      const sourceNotExcluded = !excludedSources.some(source => normalizeString(source) === normalizedLeadSource);
      return sourceIncluded && sourceNotExcluded;
    });

    const leadEmails = filteredLeads.map(lead => lead.email);
    const manualEmailsList = manualEmails.split(',').map(email => email.trim()).filter(Boolean);
    
    const allEmails = [...leadEmails, ...manualEmailsList];
    setFormData(prev => ({ ...prev, to: allEmails.join(', ') }));
  }, [leads, selectedSources, excludedSources, manualEmails]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === 'manualEmails') {
      setManualEmails(value);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSourceSelect = (source: string) => {
    if (selectedSources.includes(source)) {
      setSelectedSources(selectedSources.filter((s: string) => s !== source));
    } else {
      setSelectedSources([...selectedSources, source]);
    }
  };

  const handleSourceExclude = (source: string) => {
    if (excludedSources.includes(source)) {
      setExcludedSources(excludedSources.filter((s: string) => s !== source));
    } else {
      setExcludedSources([...excludedSources, source]);
    }
  };

  const handleTemplateChange = (values: string[]) => {
    // Pegar sempre o último template selecionado
    const templateId = values[values.length - 1];
    const template = templates.find(t => t.id.toString() === templateId);
    if (template) {
      setSelectedTemplate(template);
      setFormData(prev => ({
        ...prev,
        subject: template.subject,
        text: template.text || '',
        html: template.html || '',
        useHtml: !!template.html
      }));
    } else {
      setSelectedTemplate(null);
      setFormData(prev => ({
        ...prev,
        subject: '',
        text: '',
        html: '',
        useHtml: false
      }));
    }
  };

  const toggleUseHtml = () => {
    setFormData(prev => ({ ...prev, useHtml: !prev.useHtml }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const emailData = {
        to: formData.to.split(',').map(email => email.trim()),
        subject: formData.subject,
        text: formData.useHtml ? undefined : formData.text,
        html: formData.useHtml ? formData.html : undefined
      };

      const response = await axios.post('/api/sendEmail', emailData);
      
      toast({
        title: 'Email enviado com sucesso!',
        description: `ID da mensagem: ${response.data.messageId}`,
        variant: 'default',
      });

      setFormData({
        to: '',
        subject: '',
        text: '',
        html: '',
        useHtml: false
      });
      setSelectedTemplate(null);
      setSelectedSources([]);
      setExcludedSources([]);
      setManualEmails('');
    } catch (error: any) {
      toast({
        title: 'Erro ao enviar email',
        description: error.response?.data?.error || 'Ocorreu um erro ao enviar o email',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Envio de Emails</h1>
        <Link href="/email/templates">
          <Button variant="outline">Gerenciar Templates</Button>
        </Link>
      </div>
      
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="template">Template</Label>
            <MultiSelect
              options={templates.map(template => ({
                value: template.id.toString(),
                label: template.name
              }))}
              selected={selectedTemplate ? [selectedTemplate.id.toString()] : []}
              onChange={handleTemplateChange}
              placeholder="Selecione um template..."
              className="w-full"
            />
          </div>

          <div className="space-y-4">
            <Label>Destinatários</Label>
            
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Selecionar por Origem</Label>
              <MultiSelect
                options={availableSources.map(source => ({
                  value: source,
                  label: source
                }))}
                selected={selectedSources}
                onChange={setSelectedSources}
                placeholder="Selecione as origens..."
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Excluir Origens</Label>
              <MultiSelect
                options={availableSources.map(source => ({
                  value: source,
                  label: source
                }))}
                selected={excludedSources}
                onChange={setExcludedSources}
                placeholder="Selecione as origens para excluir..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="manualEmails">Emails Adicionais (separados por vírgula)</Label>
              <Input
                id="manualEmails"
                name="manualEmails"
                value={manualEmails}
                onChange={handleChange}
                placeholder="email1@exemplo.com, email2@exemplo.com"
              />
            </div>

            <div className="bg-muted p-4 rounded-lg space-y-2">
              <Label className="text-sm">Destinatários Selecionados:</Label>
              <div className="text-sm">
                {formData.to ? (
                  <>
                    {formData.to.split(',').slice(0, 3).map(email => email.trim()).join(', ')}
                    {formData.to.split(',').length > 3 && (
                      <span className="text-muted-foreground">
                        {' '}e mais {formData.to.split(',').length - 3} destinatários
                      </span>
                    )}
                  </>
                ) : (
                  'Nenhum destinatário selecionado'
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                Total: {formData.to ? formData.to.split(',').length : 0} destinatários
              </div>
            </div>
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
          
          <div className="flex items-center space-x-2 my-4">
            <input
              type="checkbox"
              id="useHtml"
              checked={formData.useHtml}
              onChange={toggleUseHtml}
              className="h-4 w-4"
            />
            <Label htmlFor="useHtml" className="cursor-pointer">Usar HTML no conteúdo</Label>
          </div>
          
          {formData.useHtml ? (
            <div className="space-y-2">
              <Label htmlFor="html">Conteúdo HTML</Label>
              <Textarea
                id="html"
                name="html"
                value={formData.html}
                onChange={handleChange}
                placeholder="<h1>Olá</h1><p>Conteúdo do email em HTML</p>"
                className="min-h-[200px] font-mono"
                required={formData.useHtml}
              />
              <div className="mt-2 p-4 border rounded">
                <h3 className="font-bold mb-2">Pré-visualização HTML</h3>
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: formData.html }}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="text">Conteúdo em texto</Label>
              <Textarea
                id="text"
                name="text"
                value={formData.text}
                onChange={handleChange}
                placeholder="Conteúdo do email em texto simples"
                className="min-h-[200px]"
                required={!formData.useHtml}
              />
            </div>
          )}
          
          <Button type="submit" disabled={loading || !formData.to} className="w-full">
            {loading ? 'Enviando...' : 'Enviar Email'}
          </Button>
        </form>
      </Card>
      
      <div className="mt-8 bg-muted p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Informações sobre o remetente</h2>
        <p>Todos os emails serão enviados a partir de: <strong>ai@koraxlabs.com</strong></p>
      </div>
    </div>
  );
}
