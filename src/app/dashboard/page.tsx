'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { 
  Users, 
  TrendingUp, 
  BarChart3, 
  ArrowUpRight, 
  ArrowDownRight,
  Globe,
  Calendar,
  Phone
} from 'lucide-react'

type AnalyticsData = {
  totalLeads: number
  todayLeads: number
  yesterdayLeads: number
  weekLeads: number
  monthLeads: number
  growthRate: number
  sourceData: {
    source: string
    count: number
    percentage: number
  }[]
}

export default function Dashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/analytics')
        const analyticsData = await response.json()
        setData(analyticsData)
      } catch (error) {
        console.error('Erro ao buscar analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <div className="text-center text-muted-foreground">
          Carregando dados...
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-4 md:p-8">
        <div className="text-center text-muted-foreground">
          Erro ao carregar dados analíticos
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 space-y-8">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalLeads}</div>
            <p className="text-xs text-muted-foreground">
              +{data.monthLeads} este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Crescimento</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.growthRate > 0 ? '+' : ''}{data.growthRate.toFixed(1)}%
            </div>
            <div className="flex items-center pt-1">
              {data.growthRate > 0 ? (
                <ArrowUpRight className="h-4 w-4 text-green-500" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-500" />
              )}
              <p className="text-xs text-muted-foreground ml-1">
                Desde ontem ({data.yesterdayLeads} leads)
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leads Semanais</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.weekLeads}</div>
            <p className="text-xs text-muted-foreground">
              Últimos 7 dias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leads Hoje</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.todayLeads}</div>
            <p className="text-xs text-muted-foreground">
              Novos leads hoje
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Origem dos Leads</CardTitle>
          <CardDescription>
            Distribuição de leads por canal de origem
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.sourceData.map((stat) => (
            <div key={stat.source} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{stat.source}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {stat.count} leads
                </span>
              </div>
              <Progress value={stat.percentage} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {stat.percentage.toFixed(1)}% do total
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
} 