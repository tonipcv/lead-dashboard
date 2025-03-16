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
  title: 'LeadRocket - Dashboard de Leads',
  description: 'Dashboard inteligente para gerenciamento de leads com integrações WhatsApp e Instagram',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
    other: {
      rel: 'mask-icon',
      url: '/favicon.svg',
      color: '#FF4B4B'
    }
  },
  manifest: '/manifest.json',
  themeColor: '#FF4B4B',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://lead-dashboard-mauve.vercel.app/',
    title: 'LeadRocket - Dashboard de Leads',
    description: 'Dashboard inteligente para gerenciamento de leads com integrações WhatsApp e Instagram',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'LeadRocket Dashboard'
      }
    ]
  }
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
