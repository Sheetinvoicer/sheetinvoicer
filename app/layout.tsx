import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import { Analytics } from '@vercel/analytics/react'
import { Toaster } from 'react-hot-toast'
import { LanguageProvider } from '@/lib/LanguageContext'

export const metadata = {
  title: 'SheetInvoicer - AI-Powered Invoicing Platform',
  description: 'Professional invoicing made simple with AI automation, 10+ currencies, and global payments',
  keywords: 'invoicing, AI, payments, global business, automation, SaaS',
  authors: [{ name: 'SheetInvoicer' }],
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  themeColor: '#8b5cf6',
  manifest: '/manifest.json',
  openGraph: {
    title: 'SheetInvoicer - AI-Powered Invoicing',
    description: 'Professional invoicing made simple',
    url: 'https://www.sheetinvoicer.com',
    siteName: 'SheetInvoicer',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SheetInvoicer - AI-Powered Invoicing',
    description: 'Professional invoicing made simple',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        <ThemeProvider>
          <LanguageProvider>
            {children}
            <Toaster position="top-right" />
            <Analytics />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
