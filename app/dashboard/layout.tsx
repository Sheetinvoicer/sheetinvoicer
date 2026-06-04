'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import Footer from '@/components/Footer'
import { Toaster } from 'react-hot-toast'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 pt-16 md:p-6 lg:p-8 overflow-x-auto">
          <div className="max-w-7xl mx-auto">
            <Toaster position="top-right" />
            {children}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
}
