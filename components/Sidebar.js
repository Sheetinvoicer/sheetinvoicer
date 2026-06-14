'use client'

import LanguageSwitcher from '@/components/LanguageSwitcher';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import Logo from '@/components/Logo';
import { Menu, X } from 'lucide-react';

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Invoices', href: '/dashboard/invoices', icon: '📄' },
    { name: 'Clients', href: '/dashboard/clients', icon: '👥' },
    { name: 'Expenses', href: '/dashboard/expenses', icon: '💰' },
    { name: 'Recurring', href: '/dashboard/recurring', icon: '🔄' },
    { name: 'Estimates', href: '/dashboard/estimates', icon: '📋' },
    { name: 'Settings', href: '/dashboard/settings', icon: '⚙️' },
  ];

  const sidebarContent = (
    <div className="w-72 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <Logo />
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              pathname === item.href
                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 font-semibold'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>

      {/* Footer with LanguageSwitcher and Theme Toggle */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-3">
        <LanguageSwitcher />
        
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
        >
          <span className="text-xl">{mounted && (theme === 'dark' ? '☀️' : '🌙')}</span>
          <span>{mounted && (theme === 'dark' ? 'Light Mode' : 'Dark Mode')}</span>
        </button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all"
        >
          <span className="text-xl">🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-purple-600 text-white p-2 rounded-lg shadow-lg"
      >
        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full z-40 transition-transform duration-300 lg:translate-x-0 ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {sidebarContent}
      </div>
    </>
  );
}
