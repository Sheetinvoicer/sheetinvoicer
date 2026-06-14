import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import { Analytics } from '@vercel/analytics/react'
import { Toaster } from 'react-hot-toast'
import { LanguageProvider } from '@/lib/LanguageContext'

export const metadata = {
  title: 'SheetInvoicer - AI-Powered Invoicing Platform',
  description: 'Professional invoicing made simple with AI automation, 10+ currencies',
  keywords: 'invoicing, AI, payments, global business, automation, SaaS',
  authors: [{ name: 'SheetInvoicer' }],
  manifest: '/manifest.json',
  openGraph: {
    title: 'SheetInvoicer - AI-Powered Invoicing',
    description: 'Professional invoicing made simple',
    url: 'https://www.sheetinvoicer.com',
    siteName: 'SheetInvoicer',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    type: 'website',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#8b5cf6',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body><div style="background: yellow; padding: 10px; text-align: center; font-weight: bold; position: fixed; top: 0; left: 0; right: 0; z-index: 9999;">🚀 TEST VERSION - DEPLOYMENT WORKING! 🚀</div>
        <LanguageProvider>
          <ThemeProvider>
            {children}
            <Toaster position="top-right" />
            <Analytics />
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
