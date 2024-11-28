"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  LayoutDashboard,
  MessageSquare,
  Settings,
  LayoutKanban,
} from "lucide-react"

const sidebarLinks = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "WhatsApp",
    href: "/whatsapp",
    icon: MessageSquare,
  },
  {
    title: "Configurações",
    href: "/settings",
    icon: Settings,
  },
  {
    title: "CRM",
    href: "/crm",
    icon: LayoutKanban,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="fixed left-0 h-full w-64 border-r bg-card p-6">
      <div className="flex h-full flex-col justify-between">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Lead Dashboard</h2>
          </div>
          <nav className="space-y-2">
            {sidebarLinks.map((link) => {
              const Icon = link.icon
              return (
                <Link key={link.href} href={link.href}>
                  <Button
                    variant={pathname === link.href ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-2",
                      pathname === link.href && "bg-muted"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {link.title}
                  </Button>
                </Link>
              )
            })}
          </nav>
        </div>
        <div className="flex items-center justify-between">
          <ThemeToggle />
        </div>
      </div>
    </div>
  )
} 