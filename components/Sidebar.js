'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import Logo from '@/components/Logo'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { useTranslation } from '@/hooks/useTranslation'

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { t } = useTranslation()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const navItems = [
    { name: t('nav.dashboard'), href: '/dashboard', icon: '📊' },
    { name: t('nav.invoices'), href: '/dashboard/invoices', icon: '📄' },
    { name: t('nav.clients'), href: '/dashboard/clients', icon: '👥' },
    { name: t('nav.expenses'), href: '/dashboard/expenses', icon: '💰' },
    { name: t('nav.estimates'), href: '/dashboard/estimates', icon: '📝' },
    { name: t('nav.recurring'), href: '/dashboard/recurring', icon: '🔄' },
    { name: t('nav.reports'), href: '/dashboard/reports', icon: '📈' },
    { name: t('nav.settings'), href: '/dashboard/settings', icon: '⚙️' },
    { name: 'Currency', href: '/dashboard/settings/currency', icon: '💱' },
    { name: t('nav.subscription'), href: '/dashboard/subscription', icon: '💳' },
  ]

  return (
    <>
      <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden fixed top-4 left-4 z-50 bg-blue-600 text-white p-2 rounded-lg shadow-lg">☰</button>
      <div className={`fixed lg:relative z-40 w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 min-h-screen p-6 transition-all duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="mb-8"><Logo /></div>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link key={item.name} href={item.href} onClick={() => setMobileOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${pathname === item.href ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
              <span className="text-xl">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <LanguageSwitcher />
        </div>
        <div className="absolute bottom-6 left-6 right-6 space-y-2">
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800">
            <span className="text-xl">{mounted && (theme === 'dark' ? '☀️' : '🌙')}</span>
            <span>{mounted && (theme === 'dark' ? t('nav.lightMode') : t('nav.darkMode'))}</span>
          </button>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30">
            <span className="text-xl">🚪</span>
            <span>{t('nav.logout')}</span>
          </button>
        </div>
      </div>
      {mobileOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden" onClick={() => setMobileOpen(false)} />}
    </>
  )
}
