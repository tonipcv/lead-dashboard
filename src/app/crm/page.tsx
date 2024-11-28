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

type Lead = {
  id: number
  name: string
  email: string
  phone: string
  source: string
  createdAt: string
  status: 'Base' | 'Negócio' | 'Fechado'
}

type Column = {
  id: string
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
          status: overColumn
        }),
      })

      setColumns(columns.map(col => {
        if (col.id === activeColumn) {
          return {
            ...col,
            leads: col.leads.filter(l => l.id !== lead.id)
          }
        }
        if (col.id === overColumn) {
          return {
            ...col,
            leads: [...col.leads, { ...lead, status: overColumn }]
          }
        }
        return col
      }))
    } catch (error) {
      console.error('Erro ao atualizar lead:', error)
    }

    setActiveId(null)
  }

  const renderCard = (lead: Lead) => (
    <Card className="mb-3 cursor-move hover:shadow-md transition-shadow">
      <CardHeader className="p-4">
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
          <div className="flex items-center text-muted-foreground">
            <Phone className="h-4 w-4 mr-2" />
            {lead.phone}
          </div>
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