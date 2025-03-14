import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Sidebar } from '@/components/sidebar'
import { Toaster } from "@/components/ui/toaster"
import { Providers } from './providers'
import { headers } from 'next/headers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Lead Dashboard',
  description: 'Dashboard para gerenciamento de leads',
}

async function getIsAuthPage() {
  const headersList = headers()
  const pathname = headersList.get('x-pathname') || ''
  return pathname.startsWith('/login') || pathname.startsWith('/register')
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const isAuthPage = await getIsAuthPage()

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {isAuthPage ? (
              children
            ) : (
              <div className="flex">
                <Sidebar />
                <main className="flex-1 ml-64">
                  {children}
                </main>
              </div>
            )}
            <Toaster />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  )
}
