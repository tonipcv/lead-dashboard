'use client'

import { useState, useEffect } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Phone, Mail, Calendar, MoreHorizontal, Plus } from 'lucide-react'
import { SortableItem } from './sortable-item'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type LeadStatus = 'Base' | 'Negócio' | 'Fechado'

type Lead = {
  id: number
  name: string
  email: string
  phone: string
  source: string
  createdAt: string
  status: LeadStatus
}

type Column = {
  id: LeadStatus
  title: string
  leads: Lead[]
}

interface LeadFormData {
  name: string
  email: string
  phone: string
  source: string
}

export default function CRM() {
  const [columns, setColumns] = useState<Column[]>([
    { id: 'Base', title: 'Base', leads: [] },
    { id: 'Negócio', title: 'Negócio', leads: [] },
    { id: 'Fechado', title: 'Fechado', leads: [] },
  ])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState<LeadFormData>({
    name: '',
    email: '',
    phone: '',
    source: ''
  })

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const fetchLeads = async () => {
    try {
      const response = await fetch('/api/leads')
      const data = await response.json()
      
      const newColumns = columns.map(column => ({
        ...column,
        leads: data.leads.filter((lead: Lead) => lead.status === column.id) || []
      }))
      
      setColumns(newColumns)
    } catch (error) {
      console.error('Erro ao buscar leads:', error)
    }
  }

  useEffect(() => {
    fetchLeads()
  }, [])

  const findColumn = (id: string) => {
    const column = columns.find(col => col.leads.some(lead => lead.id.toString() === id))
    return column?.id
  }

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id)
  }

  const handleDragEnd = async (event: any) => {
    const { active, over } = event
    
    if (!over) return

    const activeId = active.id
    const overId = over.id

    const activeColumn = findColumn(activeId)
    const overColumn = columns.find(col => col.id === overId)?.id || findColumn(overId)

    if (!activeColumn || !overColumn || activeColumn === overColumn) return

    const lead = columns
      .find(col => col.id === activeColumn)
      ?.leads.find(lead => lead.id.toString() === activeId)

    if (!lead) return

    try {
      await fetch(`/api/leads/${lead.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...lead,
          status: overColumn as LeadStatus
        }),
      })

      setColumns(prevColumns => 
        prevColumns.map(col => {
          if (col.id === activeColumn) {
            return {
              ...col,
              leads: col.leads.filter(l => l.id !== lead.id)
            }
          }
          if (col.id === overColumn) {
            return {
              ...col,
              leads: [...col.leads, { ...lead, status: overColumn as LeadStatus }]
            }
          }
          return col
        })
      )
    } catch (error) {
      console.error('Erro ao atualizar lead:', error)
    }

    setActiveId(null)
  }

  const renderCard = (lead: Lead) => (
    <Card className="mb-3 hover:shadow-md transition-shadow">
      <CardHeader className="p-4 cursor-move">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{lead.name}</CardTitle>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="space-y-2 text-sm">
          <div className="flex items-center text-muted-foreground">
            <Mail className="h-4 w-4 mr-2" />
            {lead.email}
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <div className="flex items-center text-muted-foreground hover:text-primary cursor-pointer select-none">
                <Phone className="h-4 w-4 mr-2" />
                {lead.phone}
              </div>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Contato</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="text-sm">
                  <p className="mb-2">Número de telefone:</p>
                  <p className="font-medium">{lead.phone}</p>
                </div>
                <div className="flex justify-center">
                  <a 
                    href={`https://web.whatsapp.com/send?phone=55${lead.phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full"
                  >
                    <Button className="w-full flex items-center justify-center" variant="default">
                      <svg 
                        viewBox="0 0 24 24" 
                        className="w-5 h-5 mr-2 fill-current"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      Abrir no WhatsApp Web
                    </Button>
                  </a>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <div className="flex items-center justify-between w-full">
          <Badge variant="secondary">
            {lead.source}
          </Badge>
          <div className="flex items-center text-muted-foreground text-xs">
            <Calendar className="h-3 w-3 mr-1" />
            {new Date(lead.createdAt).toLocaleDateString()}
          </div>
        </div>
      </CardFooter>
    </Card>
  )

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          status: 'Base'
        }),
      })

      if (!response.ok) throw new Error('Erro ao criar lead')

      const newLead = await response.json()
      
      setColumns(columns.map(col => {
        if (col.id === 'Base') {
          return {
            ...col,
            leads: [...col.leads, newLead]
          }
        }
        return col
      }))

      setFormData({
        name: '',
        email: '',
        phone: '',
        source: ''
      })
    } catch (error) {
      console.error('Erro ao criar lead:', error)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Pipeline de Vendas</h1>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Contato
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Contato</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateLead} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="source">Origem</Label>
                <Select
                  value={formData.source}
                  onValueChange={(value) => setFormData({ ...formData, source: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a origem" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Site">Site</SelectItem>
                    <SelectItem value="Indicação">Indicação</SelectItem>
                    <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                    <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={isCreating}>
                {isCreating ? 'Criando...' : 'Criar Contato'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {columns.map(column => (
            <div key={column.id} className="flex flex-col">
              <div className="bg-muted p-4 rounded-t-lg">
                <h2 className="font-semibold">{column.title}</h2>
                <div className="text-sm text-muted-foreground">
                  {column.leads.length} leads
                </div>
              </div>

              <div 
                className="flex-1 p-2 bg-muted/50 rounded-b-lg min-h-[500px]"
                id={column.id}
              >
                <SortableContext
                  items={column.leads.map(lead => lead.id.toString())}
                  strategy={verticalListSortingStrategy}
                >
                  {column.leads.map(lead => (
                    <SortableItem key={lead.id} id={lead.id.toString()}>
                      {renderCard(lead)}
                    </SortableItem>
                  ))}
                </SortableContext>
              </div>
            </div>
          ))}
        </div>

        <DragOverlay>
          {activeId ? renderCard(
            columns
              .find(col => col.leads.some(lead => lead.id.toString() === activeId))
              ?.leads.find(lead => lead.id.toString() === activeId)!
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
} 