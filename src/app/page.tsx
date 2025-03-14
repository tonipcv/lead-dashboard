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
  Trash2,
  Loader2,
  Check
} from 'lucide-react'
import { ThemeToggle } from "@/components/theme-toggle"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import Image from 'next/image'
import { cn } from "@/lib/utils"
import { ImportCsvDialog } from "@/components/import-csv-dialog"

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
  messageSent: boolean
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
  const { toast } = useToast()
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
  const [sourceFilter, setSourceFilter] = useState<string>('all')
  const [uniqueSources, setUniqueSources] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [pageSize] = useState(10)
  const [isLoading, setIsLoading] = useState(false)
  const [totalLeads, setTotalLeads] = useState(0)
  const [sendingMessage, setSendingMessage] = useState<number | null>(null)

  const fetchLeads = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/leads?page=${currentPage}&pageSize=${pageSize}${sourceFilter !== 'all' ? `&source=${encodeURIComponent(sourceFilter)}` : ''}`)
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

  const handleSendMessage = async (lead: Lead) => {
    if (!lead.phone) {
      toast({
        title: "Erro",
        description: "Este lead não possui número de telefone cadastrado.",
        variant: "destructive",
      })
      return
    }

    setSendingMessage(lead.id)
    try {
      console.log('Enviando mensagem para:', lead.phone)

      const response = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          phone: lead.phone.replace(/\D/g, ''),
          leadId: lead.id
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Erro ao enviar mensagem')
      }

      setLeads(prevLeads => 
        prevLeads.map(l => 
          l.id === lead.id 
            ? { ...l, messageSent: true }
            : l
        )
      )

      toast({
        title: "Sucesso!",
        description: "Mensagem enviada com sucesso.",
      })
    } catch (error: any) {
      console.error('Erro ao enviar mensagem:', error)
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setSendingMessage(null)
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

  const filteredLeads = leads.filter((lead) => {
    // Only filter by search term client-side since source filtering is now done server-side
    return lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.source.toLowerCase().includes(searchTerm.toLowerCase());
  })

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  // Fetch all sources for the filter dropdown
  const fetchAllSources = async () => {
    try {
      const response = await fetch('/api/leads/sources');
      const data = await response.json();
      if (data.sources) {
        setUniqueSources(data.sources);
      }
    } catch (error) {
      console.error('Erro ao buscar origens:', error);
    }
  };

  // Initial load
  useEffect(() => {
    fetchLeads();
    fetchAllSources();
  }, []);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [sourceFilter]);

  // Fetch leads when page or filter changes
  useEffect(() => {
    fetchLeads();
  }, [currentPage, sourceFilter]);

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
                  className="pl-8 focus-visible:ring-teal-500"
                />
                <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-muted-foreground" />
              </div>
              
              <div className="relative w-full sm:w-48">
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                >
                  <option value="all">Todas as origens</option>
                  {uniqueSources.map((source) => (
                    <option key={source} value={source}>{source}</option>
                  ))}
                </select>
                <Globe className="w-4 h-4 absolute right-3 top-3 text-muted-foreground pointer-events-none" />
              </div>
              
              <div className="flex items-center gap-2">
                <ImportCsvDialog onImportComplete={fetchLeads} />
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex-1 sm:flex-none bg-teal-500 hover:bg-teal-600 text-white">
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
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        {lead.name}
                      </div>
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
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        {lead.email}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {isEditing && editingLead?.id === lead.id ? (
                      <Input
                        value={editingLead.phone}
                        onChange={(e) => setEditingLead({ ...editingLead, phone: e.target.value })}
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        {lead.phone}
                      </div>
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
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-gray-500" />
                        <Badge variant="secondary" className="font-normal bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300">
                          {lead.source}
                        </Badge>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
                    </div>
                  </TableCell>
                  <TableCell>
                    {isEditing && editingLead?.id === lead.id ? (
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" className="text-teal-500 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/30" onClick={handleSave}>
                          <Save className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-500 hover:text-red-700 hover:bg-red-100"
                          onClick={() => handleDelete(lead.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-teal-500 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/30" onClick={handleCancel}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant={lead.messageSent ? "default" : "outline"}
                          onClick={() => handleSendMessage(lead)}
                          disabled={sendingMessage === lead.id || !lead.phone}
                          title={!lead.phone ? "Lead sem número de telefone" : lead.messageSent ? "Mensagem já enviada" : "Enviar mensagem"}
                          className={cn(
                            lead.messageSent && "bg-green-500 hover:bg-green-600 text-white"
                          )}
                        >
                          {sendingMessage === lead.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : lead.messageSent ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <MessageSquare className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(lead)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(lead.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
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
                      className={cn(
                        "w-8",
                        currentPage === page && "bg-teal-500 hover:bg-teal-600 text-white"
                      )}
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