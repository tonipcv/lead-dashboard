import '@/app/globals.css'
import { ThemeProvider } from "@/providers/theme-provider"
import { NavMenu } from "@/components/nav-menu"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex min-h-screen">
            <NavMenu />
            <div className="flex-1 flex flex-col min-h-screen md:pl-64">
              <div className="flex-1">
                {children}
              </div>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
