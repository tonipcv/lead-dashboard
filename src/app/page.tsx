'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Phone, 
  Mail, 
  User, 
  Plus, 
  Edit2, 
  Save, 
  X, 
  MessageSquare,
  Globe,
  Calendar,
  Search,
  Upload,
  Trash2
} from 'lucide-react'
import { ThemeToggle } from "@/components/theme-toggle"
import { Badge } from "@/components/ui/badge"
import Image from 'next/image'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

type Lead = {
  id: number
  name: string
  email: string
  phone: string
  source: string
  createdAt: string
}

type ColumnMapping = {
  name: string;
  email: string;
  phone: string;
  source: string;
}

const getPaginationRange = (currentPage: number, totalPages: number) => {
  const delta = 2
  const rangeWithDots: (number | string)[] = []
  let lastNumber: number | undefined

  const range = (start: number, end: number) => {
    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  }

  const rangeStart = Math.max(2, currentPage - delta)
  const rangeEnd = Math.min(totalPages - 1, currentPage + delta)

  for (const i of range(rangeStart, rangeEnd)) {
    if (lastNumber) {
      if (i - lastNumber === 2) {
        rangeWithDots.push(lastNumber + 1)
      } else if (i - lastNumber !== 1) {
        rangeWithDots.push('...')
      }
    }
    rangeWithDots.push(i)
    lastNumber = i
  }

  return [1, ...rangeWithDots, totalPages]
}

export default function Home() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newLead, setNewLead] = useState({
    name: '',
    email: '',
    phone: '',
    source: ''
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
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
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [pageSize] = useState(10)
  const [isLoading, setIsLoading] = useState(false)
  const [totalLeads, setTotalLeads] = useState(0)
  const [importResults, setImportResults] = useState<string | null>(null)

  const fetchLeads = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/leads?page=${currentPage}&pageSize=${pageSize}`)
      const data = await response.json()
      setLeads(data.leads)
      setTotalPages(data.totalPages)
      setTotalLeads(data.total)
    } catch (error) {
      console.error('Erro ao buscar leads:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (lead: Lead) => {
    setEditingLead(lead)
    setIsEditing(true)
  }

  const handleSave = async () => {
    if (!editingLead) return

    try {
      const response = await fetch(`/api/leads/${editingLead.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingLead),
      })

      if (response.ok) {
        await fetchLeads()
        setIsEditing(false)
        setEditingLead(null)
      } else {
        console.error('Erro ao salvar lead')
      }
    } catch (error) {
      console.error('Erro ao salvar lead:', error)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditingLead(null)
  }

  const handleCreate = async () => {
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newLead),
      })

      if (response.ok) {
        await fetchLeads()
        setIsModalOpen(false)
        setNewLead({ name: '', email: '', phone: '', source: '' })
      } else {
        console.error('Erro ao criar lead')
      }
    } catch (error) {
      console.error('Erro ao criar lead:', error)
    }
  }

  const handleCsvImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
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
      }
    } catch (error) {
      console.error('Erro ao processar CSV:', error)
    }
  }

  const handleConfirmImport = async () => {
    try {
      const mappedData = csvPreviewData.map(row => ({
        name: row[columnMapping.name],
        email: row[columnMapping.email],
        phone: row[columnMapping.phone],
        source: useDefaultSource ? defaultSource : row[columnMapping.source]
      }))

      const response = await fetch('/api/leads/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ leads: mappedData }),
      })

      const result = await response.json()

      if (response.ok) {
        setImportResults(result.message)
        await fetchLeads()
        setTimeout(() => {
          setIsImportModalOpen(false)
          setIsPreviewMode(false)
          setCsvPreviewData([])
          setCsvColumns([])
          setColumnMapping({ name: '', email: '', phone: '', source: '' })
          setUseDefaultSource(false)
          setDefaultSource('')
          setImportResults(null)
        }, 3000)
      } else {
        setImportResults(`Erro: ${result.error}`)
      }
    } catch (error) {
      console.error('Erro ao importar leads:', error)
      setImportResults('Erro ao importar leads. Tente novamente.')
    }
  }

  const handleDelete = async (leadId: number) => {
    if (!confirm('Tem certeza que deseja excluir este lead?')) return;

    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchLeads();
      } else {
        console.error('Erro ao excluir lead');
      }
    } catch (error) {
      console.error('Erro ao excluir lead:', error);
    }
  };

  const filteredLeads = leads.filter((lead) =>
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.source.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  useEffect(() => {
    fetchLeads()
  }, [currentPage])

  const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
    return (
      <div className="flex items-center justify-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Anterior
        </Button>

        {getPaginationRange(currentPage, totalPages).map((page, index) => (
          <Button
            key={index}
            variant={currentPage === page ? "default" : "outline"}
            size="sm"
            onClick={() => typeof page === 'number' && onPageChange(page)}
            disabled={typeof page === 'string'}
          >
            {page}
          </Button>
        ))}

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Próxima
        </Button>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 space-y-4">
      <div className="rounded-lg border bg-card">
        <div className="p-4 md:p-6 border-b">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative w-full sm:w-64">
                <Input
                  placeholder="Buscar leads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
                <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-muted-foreground" />
              </div>
              <div className="flex items-center gap-2">
                <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex-1 sm:flex-none">
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
                          />
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
                                          ? <Badge variant="secondary" className="font-normal">{defaultSource}</Badge>
                                          : (columnMapping.source ? <Badge variant="secondary" className="font-normal">{row[columnMapping.source]}</Badge> : '-')}
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
                        onClick={() => {
                          setIsImportModalOpen(false)
                          setIsPreviewMode(false)
                          setCsvPreviewData([])
                          setCsvColumns([])
                          setColumnMapping({ name: '', email: '', phone: '', source: '' })
                          setUseDefaultSource(false)
                          setDefaultSource('')
                        }}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancelar
                      </Button>
                      {isPreviewMode && (
                        <Button 
                          onClick={handleConfirmImport}
                          disabled={
                            !columnMapping.name || 
                            !columnMapping.email || 
                            !columnMapping.phone || 
                            (!useDefaultSource && !columnMapping.source) ||
                            (useDefaultSource && !defaultSource)
                          }
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Confirmar Importação
                        </Button>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex-1 sm:flex-none">
                      <Plus className="w-4 h-4 mr-2" />
                      <span>Adicionar Lead</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Adicionar Novo Lead</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name" className="flex items-center space-x-2">
                          <User className="w-4 h-4" />
                          <span>Nome</span>
                        </Label>
                        <Input
                          id="name"
                          value={newLead.name}
                          onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="email" className="flex items-center space-x-2">
                          <Mail className="w-4 h-4" />
                          <span>Email</span>
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={newLead.email}
                          onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="phone" className="flex items-center space-x-2">
                          <Phone className="w-4 h-4" />
                          <span>Telefone</span>
                        </Label>
                        <Input
                          id="phone"
                          value={newLead.phone}
                          onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="source" className="flex items-center space-x-2">
                          <Globe className="w-4 h-4" />
                          <span>Origem</span>
                        </Label>
                        <Input
                          id="source"
                          value={newLead.source}
                          onChange={(e) => setNewLead({ ...newLead, source: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                        <X className="w-4 h-4 mr-2" />
                        Cancelar
                      </Button>
                      <Button onClick={handleCreate}>
                        <Save className="w-4 h-4 mr-2" />
                        Salvar
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap w-[30%]">
                  <User className="w-4 h-4 mr-2 inline" />Nome
                </TableHead>
                <TableHead className="whitespace-nowrap w-[30%]">
                  <Mail className="w-4 h-4 mr-2 inline" />Email
                </TableHead>
                <TableHead className="whitespace-nowrap w-[15%]">
                  <Phone className="w-4 h-4 mr-2 inline" />Telefone
                </TableHead>
                <TableHead className="whitespace-nowrap w-[15%]">
                  <Globe className="w-4 h-4 mr-2 inline" />Origem
                </TableHead>
                <TableHead className="whitespace-nowrap w-[10%]">
                  <Calendar className="w-4 h-4 mr-2 inline" />Data
                </TableHead>
                <TableHead className="w-[80px] text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium max-w-[200px] truncate">
                    {isEditing && editingLead?.id === lead.id ? (
                      <Input
                        value={editingLead.name}
                        onChange={(e) => setEditingLead({ ...editingLead, name: e.target.value })}
                      />
                    ) : (
                      lead.name
                    )}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {isEditing && editingLead?.id === lead.id ? (
                      <Input
                        type="email"
                        value={editingLead.email}
                        onChange={(e) => setEditingLead({ ...editingLead, email: e.target.value })}
                      />
                    ) : (
                      lead.email
                    )}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {isEditing && editingLead?.id === lead.id ? (
                      <Input
                        value={editingLead.phone}
                        onChange={(e) => setEditingLead({ ...editingLead, phone: e.target.value })}
                      />
                    ) : (
                      lead.phone
                    )}
                  </TableCell>
                  <TableCell className="max-w-[200px]">
                    {isEditing && editingLead?.id === lead.id ? (
                      <Input
                        value={editingLead.source}
                        onChange={(e) => setEditingLead({ ...editingLead, source: e.target.value })}
                        placeholder="Digite a origem e pressione Enter"
                      />
                    ) : (
                      <Badge variant="secondary" className="font-normal">
                        {lead.source}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    {isEditing && editingLead?.id === lead.id ? (
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" onClick={handleSave}>
                          <Save className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDelete(lead.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={handleCancel}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(lead)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="p-4 border-t">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground order-2 md:order-1">
              <div>Total de {totalLeads} leads</div>
              <div className="hidden md:block">Mostrando página {currentPage} de {totalPages}</div>
            </div>
            
            <div className="flex items-center gap-2 order-1 md:order-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || isLoading}
              >
                Anterior
              </Button>
              
              <div className="hidden md:flex items-center gap-1">
                {getPaginationRange(currentPage, totalPages).map((page, index) => (
                  typeof page === 'number' ? (
                    <Button
                      key={index}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                      disabled={isLoading}
                      className="w-8"
                    >
                      {page}
                    </Button>
                  ) : (
                    <span key={index} className="px-2">
                      {page}
                    </span>
                  )
                ))}
              </div>
              
              <div className="md:hidden">
                <span className="text-sm px-2">
                  {currentPage} / {totalPages}
                </span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || isLoading}
              >
                Próxima
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 