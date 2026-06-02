'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import Footer from '@/components/Footer'

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
    return null // or a loading spinner
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
}
