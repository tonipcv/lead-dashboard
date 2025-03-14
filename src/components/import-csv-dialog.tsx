'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Upload, Save, X, Loader2 } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type ColumnMapping = {
  name: string;
  email: string;
  phone: string;
  source: string;
}

interface ImportCsvDialogProps {
  onImportComplete: () => void;
}

export function ImportCsvDialog({ onImportComplete }: ImportCsvDialogProps) {
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [csvPreviewData, setCsvPreviewData] = useState<any[]>([])
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [csvColumns, setCsvColumns] = useState<string[]>([])
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({
    name: '',
    email: '',
    phone: '',
    source: ''
  })
  const [useDefaultSource, setUseDefaultSource] = useState(false)
  const [defaultSource, setDefaultSource] = useState('')
  const [importResults, setImportResults] = useState<string | null>(null)

  const handleCsvImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setIsLoading(true);
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/leads/preview', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const { headers, data } = await response.json()
        setCsvColumns(headers)
        setCsvPreviewData(data)
        setIsPreviewMode(true)
        
        const initialMapping: ColumnMapping = {
          name: headers.find((h: string) => h.toLowerCase().includes('nome') || h.toLowerCase().includes('name')) || '',
          email: headers.find((h: string) => h.toLowerCase().includes('email')) || '',
          phone: headers.find((h: string) => 
            h.toLowerCase().includes('telefone') || 
            h.toLowerCase().includes('phone') || 
            h.toLowerCase().includes('tel')
          ) || '',
          source: headers.find((h: string) => 
            h.toLowerCase().includes('origem') || 
            h.toLowerCase().includes('source') || 
            h.toLowerCase().includes('fonte')
          ) || ''
        }
        setColumnMapping(initialMapping)
      } else {
        console.error('Erro ao processar CSV')
        toast({
          title: "Erro",
          description: "Não foi possível processar o arquivo CSV",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Erro ao processar CSV:', error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao processar o arquivo CSV",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false);
    }
  }

  const handleConfirmImport = async () => {
    try {
      setIsImporting(true);
      setImportProgress(0);
      
      const mappedData = csvPreviewData.map(row => ({
        name: row[columnMapping.name],
        email: row[columnMapping.email],
        phone: row[columnMapping.phone],
        source: useDefaultSource ? defaultSource : row[columnMapping.source]
      }))

      // Simular progresso para feedback visual
      const progressInterval = setInterval(() => {
        setImportProgress(prev => {
          const newProgress = prev + (100 - prev) * 0.1;
          return newProgress > 95 ? 95 : newProgress;
        });
      }, 300);

      const response = await fetch('/api/leads/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ leads: mappedData }),
      })

      clearInterval(progressInterval);
      setImportProgress(100);

      const result = await response.json()

      if (response.ok) {
        setImportResults(result.message)
        onImportComplete();
        setTimeout(() => {
          resetState();
          setIsOpen(false);
        }, 3000)
      } else {
        setImportResults(`Erro: ${result.error}`)
        setIsImporting(false);
        setImportProgress(0);
      }
    } catch (error) {
      console.error('Erro ao importar leads:', error)
      setImportResults('Erro ao importar leads. Tente novamente.')
      setIsImporting(false);
      setImportProgress(0);
    }
  }

  const resetState = () => {
    setIsPreviewMode(false);
    setCsvPreviewData([]);
    setCsvColumns([]);
    setColumnMapping({ name: '', email: '', phone: '', source: '' });
    setUseDefaultSource(false);
    setDefaultSource('');
    setImportResults(null);
    setIsImporting(false);
    setImportProgress(0);
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetState();
    }
    setIsOpen(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex-1 sm:flex-none border-teal-500 text-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/30">
          <Upload className="w-4 h-4 mr-2" />
          <span>Importar CSV</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Importar Leads via CSV</DialogTitle>
        </DialogHeader>
        {!isPreviewMode ? (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="csvFile">Arquivo CSV</Label>
              <Input
                id="csvFile"
                type="file"
                accept=".csv"
                onChange={handleCsvImport}
                disabled={isLoading}
              />
              {isLoading && (
                <div className="flex items-center justify-center mt-2">
                  <Loader2 className="w-5 h-5 mr-2 animate-spin text-teal-500" />
                  <span className="text-sm text-muted-foreground">Processando arquivo...</span>
                </div>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              <p>O arquivo CSV deve conter colunas que possam ser mapeadas para:</p>
              <ul className="list-disc list-inside mt-2">
                <li>Nome do Lead</li>
                <li>Email do Lead</li>
                <li>Telefone do Lead</li>
                <li>Origem do Lead</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            {isImporting && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Importando leads...</span>
                  <span className="text-sm text-muted-foreground">{Math.round(importProgress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                  <div 
                    className="bg-teal-500 h-2.5 rounded-full transition-all duration-300" 
                    style={{ width: `${importProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="text-sm font-medium">Mapeamento de Colunas</div>
                <div className="grid gap-3">
                  <div className="grid gap-2">
                    <Label>Nome do Lead</Label>
                    <select
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1"
                      value={columnMapping.name}
                      onChange={(e) => setColumnMapping({ ...columnMapping, name: e.target.value })}
                    >
                      <option value="">Selecione a coluna</option>
                      {csvColumns.map((column) => (
                        <option key={column} value={column}>{column}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Email do Lead</Label>
                    <select
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1"
                      value={columnMapping.email}
                      onChange={(e) => setColumnMapping({ ...columnMapping, email: e.target.value })}
                    >
                      <option value="">Selecione a coluna</option>
                      {csvColumns.map((column) => (
                        <option key={column} value={column}>{column}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Telefone do Lead</Label>
                    <select
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1"
                      value={columnMapping.phone}
                      onChange={(e) => setColumnMapping({ ...columnMapping, phone: e.target.value })}
                    >
                      <option value="">Selecione a coluna</option>
                      {csvColumns.map((column) => (
                        <option key={column} value={column}>{column}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Origem do Lead</Label>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="useDefaultSource"
                          checked={useDefaultSource}
                          onChange={(e) => setUseDefaultSource(e.target.checked)}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor="useDefaultSource">Usar origem padrão para todos</Label>
                      </div>
                      {useDefaultSource ? (
                        <Input
                          placeholder="Digite a origem padrão"
                          value={defaultSource}
                          onChange={(e) => setDefaultSource(e.target.value)}
                        />
                      ) : (
                        <select
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1"
                          value={columnMapping.source}
                          onChange={(e) => setColumnMapping({ ...columnMapping, source: e.target.value })}
                        >
                          <option value="">Selecione a coluna</option>
                          {csvColumns.map((column) => (
                            <option key={column} value={column}>{column}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="text-sm font-medium">
                  Preview dos dados ({csvPreviewData.length} registros):
                </div>
                <div className="max-h-[400px] overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Telefone</TableHead>
                        <TableHead>Origem</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {csvPreviewData.slice(0, 5).map((row, index) => (
                        <TableRow key={index}>
                          <TableCell>{columnMapping.name ? row[columnMapping.name] : '-'}</TableCell>
                          <TableCell>{columnMapping.email ? row[columnMapping.email] : '-'}</TableCell>
                          <TableCell>{columnMapping.phone ? row[columnMapping.phone] : '-'}</TableCell>
                          <TableCell>
                            {useDefaultSource 
                              ? <Badge variant="secondary" className="font-normal bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300">{defaultSource}</Badge>
                              : (columnMapping.source ? <Badge variant="secondary" className="font-normal bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300">{row[columnMapping.source]}</Badge> : '-')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {csvPreviewData.length > 5 && (
                    <div className="text-sm text-muted-foreground mt-2 text-center">
                      Mostrando 5 de {csvPreviewData.length} registros
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        {importResults && (
          <div className={`p-4 mb-4 rounded-md ${
            importResults.startsWith('Erro') 
              ? 'bg-red-100 text-red-700' 
              : 'bg-green-100 text-green-700'
          }`}>
            {importResults}
          </div>
        )}
        <div className="flex justify-end space-x-2">
          <Button 
            variant="outline" 
            onClick={() => handleOpenChange(false)}
            disabled={isImporting}
          >
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          {isPreviewMode && (
            <Button 
              onClick={handleConfirmImport}
              disabled={
                isImporting ||
                !columnMapping.name || 
                !columnMapping.email || 
                !columnMapping.phone || 
                (!useDefaultSource && !columnMapping.source) ||
                (useDefaultSource && !defaultSource)
              }
            >
              {isImporting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Importando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Confirmar Importação
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 