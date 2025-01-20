"use client"

import Link from 'next/link'
import { ThemeToggle } from './theme-toggle'
import { 
  LayoutDashboard,
  ScrollText,
  Users,
  Rocket,
  Webhook
} from 'lucide-react'
import { usePathname } from 'next/navigation'
import { cn } from "@/lib/utils"

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="fixed left-0 top-0 h-full w-64 border-r bg-background p-4">
      <div className="flex flex-col h-full">
        <div className="mb-8 flex items-center">
          <Rocket className="w-8 h-8 text-teal-500" />
          <span className="ml-2 text-xl font-bold text-teal-500">LeadRocket</span>
        </div>

        <nav className="space-y-2 flex-1">
          <Link 
            href="/dashboard" 
            className={cn(
              "flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors",
              pathname === "/dashboard"
                ? "bg-teal-500 text-white hover:bg-teal-600"
                : "hover:bg-teal-50 hover:text-teal-500 dark:hover:bg-teal-900/30"
            )}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </Link>

          <Link 
            href="/" 
            className={cn(
              "flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors",
              pathname === "/"
                ? "bg-teal-500 text-white hover:bg-teal-600"
                : "hover:bg-teal-50 hover:text-teal-500 dark:hover:bg-teal-900/30"
            )}
          >
            <Users className="w-5 h-5" />
            <span>Leads</span>
          </Link>

          <Link 
            href="/crm" 
            className={cn(
              "flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors",
              pathname === "/crm"
                ? "bg-teal-500 text-white hover:bg-teal-600"
                : "hover:bg-teal-50 hover:text-teal-500 dark:hover:bg-teal-900/30"
            )}
          >
            <ScrollText className="w-5 h-5" />
            <span>CRM</span>
          </Link>

          <Link 
            href="/webhook" 
            className={cn(
              "flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors",
              pathname === "/webhook"
                ? "bg-teal-500 text-white hover:bg-teal-600"
                : "hover:bg-teal-50 hover:text-teal-500 dark:hover:bg-teal-900/30"
            )}
          >
            <Webhook className="w-5 h-5" />
            <span>Webhook</span>
          </Link>
        </nav>

        <div className="pt-4 border-t">
          <ThemeToggle />
        </div>
      </div>
    </div>
  )
} 