'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { 
  Menu,
  Home,
  MessageSquare,
  Users,
  Settings,
  BarChart2,
  X 
} from 'lucide-react'
import { cn } from "@/lib/utils"
import { ThemeToggle } from './theme-toggle'

const routes = [
  {
    href: '/',
    label: 'Dashboard',
    icon: Home
  },
  {
    href: '/analytics',
    label: 'Analytics',
    icon: BarChart2
  },
  {
    href: '/leads',
    label: 'Leads',
    icon: Users
  },
  {
    href: '/crm',
    label: 'CRM',
    icon: MessageSquare
  },
  {
    href: '/settings',
    label: 'Configurações',
    icon: Settings
  }
]

export function NavMenu() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-col md:fixed md:inset-y-0 z-30">
        <div className="flex flex-col w-64 bg-background border-r h-full">
          <div className="h-16 flex items-center px-4 border-b">
            <h1 className="text-lg font-semibold">LeadManager</h1>
          </div>
          <div className="flex-1 flex flex-col justify-between py-4">
            <nav className="flex-1 px-4 space-y-1">
              {routes.map((route) => {
                const Icon = route.icon
                return (
                  <Link 
                    key={route.href} 
                    href={route.href}
                    className={cn(
                      "flex items-center gap-x-2 text-sm font-medium px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors",
                      pathname === route.href && "bg-accent text-accent-foreground"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    {route.label}
                  </Link>
                )
              })}
            </nav>
            <div className="px-4 pt-4 border-t">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-background border-b">
        <div className="flex items-center justify-between h-16 px-4">
          <h1 className="text-lg font-semibold">LeadManager</h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px]">
                <nav className="flex flex-col gap-4 mt-4">
                  {routes.map((route) => {
                    const Icon = route.icon
                    return (
                      <Link 
                        key={route.href} 
                        href={route.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex items-center gap-x-2 text-sm font-medium p-3 hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors",
                          pathname === route.href && "bg-accent text-accent-foreground"
                        )}
                      >
                        <Icon className="w-5 h-5" />
                        {route.label}
                      </Link>
                    )
                  })}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Mobile Content Padding */}
      <div className="h-16 md:hidden" />
    </>
  )
} 