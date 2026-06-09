'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: '✨' },
  { name: 'Invoices', href: '/dashboard/invoices', icon: '📄' },
  { name: 'Clients', href: '/dashboard/clients', icon: '👥' },
  { name: 'Expenses', href: '/dashboard/expenses', icon: '💰' },
  { name: 'Estimates', href: '/dashboard/estimates', icon: '📋' },
  { name: 'Recurring', href: '/dashboard/recurring', icon: '🔄' },
  { name: 'Settings', href: '/dashboard/settings', icon: '⚙️' },
];

export default function GlassSidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-6 left-6 z-50 w-12 h-12 rounded-2xl bg-white dark:bg-white/10 backdrop-blur-xl border border-gray-300 dark:border-white/20 text-gray-700 dark:text-white text-2xl hover:bg-gray-100 dark:hover:bg-white/20 transition-all shadow-lg"
      >
        {isOpen ? '◀' : '▶'}
      </button>

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{ x: isOpen ? 0 : -300 }}
        transition={{ type: 'spring', damping: 25 }}
        className="fixed left-0 top-0 z-40 h-screen w-72 bg-white dark:bg-white/10 backdrop-blur-2xl border-r border-gray-200 dark:border-white/20 shadow-2xl"
      >
        <div className="flex flex-col h-full p-6">
          {/* Logo */}
          <div className="mb-12 mt-16">
            <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              SheetInvoicer
            </div>
            <p className="text-purple-600 dark:text-purple-200 text-xs mt-2">AI-Powered · 2026</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {navItems.map((item) => (
              <Link key={item.name} href={item.href}>
                <motion.div
                  whileHover={{ x: 8 }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${
                    pathname === item.href
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10'
                  }`}
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span>{item.name}</span>
                </motion.div>
              </Link>
            ))}
          </nav>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/20 transition-all mt-auto"
          >
            <span className="text-2xl">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </motion.div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
