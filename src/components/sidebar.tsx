"use client"

import Link from 'next/link'
import { ThemeToggle } from './theme-toggle'
import { 
  LayoutDashboard,
  ScrollText,
  Users,
  Webhook,
  MessageSquare,
  MessagesSquare,
  Instagram,
  Mail
} from 'lucide-react'
import { usePathname } from 'next/navigation'
import { cn } from "@/lib/utils"

const menuItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard
  },
  {
    title: 'Leads',
    href: '/',
    icon: Users
  },
  {
    title: 'Conversas',
    href: '/conversas',
    icon: MessagesSquare
  },
  {
    title: 'Instagram',
    href: '/instagram',
    icon: Instagram
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="fixed left-0 top-0 h-full w-64 border-r bg-white p-4">
      <div className="flex flex-col h-full">
        <div className="mb-8">
          <Link href="/" className="flex items-center px-4">
            <span className="text-2xl font-bold tracking-tighter">KTS</span>
          </Link>
        </div>

        <nav className="space-y-2 flex-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors',
                  isActive 
                    ? 'bg-black text-white'
                    : 'text-zinc-600 hover:bg-zinc-100'
                )}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.title}</span>
              </Link>
            )
          })}
        </nav>

        <div className="pt-4 border-t border-zinc-200">
          <ThemeToggle />
        </div>
      </div>
    </div>
  )
} 