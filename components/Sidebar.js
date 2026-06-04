'use client'

import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import Logo from '@/components/Logo'

export default function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const toggleMenu = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setMobileOpen(!mobileOpen)
  }

  const handleNavigation = (href) => {
    setMobileOpen(false)
    router.push(href)
  }

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Invoices', href: '/dashboard/invoices', icon: '📄' },
    { name: 'Clients', href: '/dashboard/clients', icon: '👥' },
    { name: 'Recurring', href: '/dashboard/recurring', icon: '🔄' },
    { name: 'Settings', href: '/dashboard/settings', icon: '⚙️' },
    { name: 'Subscription', href: '/dashboard/subscription', icon: '💳' },
  ]

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={toggleMenu}
        className="lg:hidden fixed top-4 left-4 z-50 bg-blue-600 text-white p-3 rounded-lg shadow-lg active:bg-blue-700 transition-colors"
        style={{ minWidth: '48px', minHeight: '48px' }}
        aria-label="Menu"
      >
        ☰
      </button>

      {/* Sidebar */}
      <div
        className={`fixed lg:relative z-40 w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 min-h-screen p-6 transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="mb-8">
          <Logo />
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => handleNavigation(item.href)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left active:bg-gray-100 dark:active:bg-gray-800 ${
                pathname === item.href
                  ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-semibold'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
              style={{ minHeight: '48px' }}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.name}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-6 left-6 right-6 space-y-2">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all active:bg-gray-100"
            style={{ minHeight: '48px' }}
          >
            <span className="text-xl">{mounted && (theme === 'dark' ? '☀️' : '🌙')}</span>
            <span>{mounted && (theme === 'dark' ? 'Light Mode' : 'Dark Mode')}</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all active:bg-red-100"
            style={{ minHeight: '48px' }}
          >
            <span className="text-xl">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  )
}
