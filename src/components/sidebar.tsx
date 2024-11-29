"use client"

import Link from 'next/link'
import { ThemeToggle } from './theme-toggle'
import { 
  LayoutDashboard,
  ScrollText,
  Users,
  Rocket
} from 'lucide-react'

export function Sidebar() {
  return (
    <div className="fixed left-0 top-0 h-full w-64 border-r bg-background p-4">
      <div className="flex flex-col h-full">
        <div className="mb-8 flex items-center">
          <Rocket className="w-8 h-8" />
          <span className="ml-2 text-xl font-bold">LeadRocket</span>
        </div>

        <nav className="space-y-2 flex-1">
          <Link 
            href="/dashboard" 
            className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-accent"
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </Link>

          <Link 
            href="/" 
            className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-accent"
          >
            <Users className="w-5 h-5" />
            <span>Leads</span>
          </Link>

          <Link 
            href="/crm" 
            className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-accent"
          >
            <ScrollText className="w-5 h-5" />
            <span>CRM</span>
          </Link>
        </nav>

        <div className="pt-4 border-t">
          <ThemeToggle />
        </div>
      </div>
    </div>
  )
} 