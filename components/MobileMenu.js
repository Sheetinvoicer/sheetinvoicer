'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';

const MENU_ITEMS = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊', color: '#3b82f6' },
  { name: 'Invoices', href: '/dashboard/invoices', icon: '📄', color: '#10b981' },
  { name: 'Clients', href: '/dashboard/clients', icon: '👥', color: '#8b5cf6' },
  { name: 'Estimates', href: '/dashboard/estimates', icon: '📋', color: '#f59e0b' },
  { name: 'Expenses', href: '/dashboard/expenses', icon: '💰', color: '#ef4444' },
  { name: 'Recurring', href: '/dashboard/recurring', icon: '🔄', color: '#06b6d4' },
  { name: 'Settings', href: '/dashboard/settings', icon: '⚙️', color: '#6b7280' },
];

const QUICK_ACTIONS = [
  { name: 'Create', icon: '➕', action: 'create', color: '#3b82f6' },
  { name: 'Search', icon: '🔍', action: 'search', color: '#8b5cf6' },
  { name: 'AI', icon: '🤖', action: 'ai', color: '#ec4899' },
  { name: 'Menu', icon: '☰', action: 'menu', color: '#6b7280' },
];

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    setIsOpen(false);
    setIsSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  }, [pathname]);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      performSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  async function performSearch() {
    setSearching(true);
    try {
      // Search invoices by invoice_number
      const { data: invoices, error: invError } = await supabase
        .from('invoices')
        .select('invoice_number, id, total, status')
        .ilike('invoice_number', `%${searchQuery}%`)
        .limit(5);
      
      if (invError) console.error('Invoice search error:', invError);
      
      // Search clients by name or email
      const { data: clients, error: clientError } = await supabase
        .from('clients')
        .select('id, name, email')
        .ilike('name', `%${searchQuery}%`)
        .limit(5);
      
      if (clientError) console.error('Client search error:', clientError);
      
      const results = [];
      
      // Add invoice results
      if (invoices && invoices.length > 0) {
        invoices.forEach(inv => {
          results.push({
            type: 'invoice',
            id: inv.id,
            title: inv.invoice_number,
            subtitle: `Total: ${inv.total || 0} • Status: ${inv.status || 'draft'}`,
            link: `/dashboard/invoices/${inv.id}`,
            icon: '📄'
          });
        });
      }
      
      // Add client results
      if (clients && clients.length > 0) {
        clients.forEach(client => {
          results.push({
            type: 'client',
            id: client.id,
            title: client.name,
            subtitle: client.email || 'No email',
            link: `/dashboard/clients/${client.id}`,
            icon: '👥'
          });
        });
      }
      
      setSearchResults(results);
    } catch (err) {
      console.error('Search error:', err);
      setSearchResults([]);
    }
    setSearching(false);
  }

  const handleAction = (action) => {
    switch(action) {
      case 'create':
        router.push('/dashboard/invoices/new');
        break;
      case 'search':
        setIsSearchOpen(true);
        break;
      case 'ai':
        if (typeof window !== 'undefined' && window.openAIAssistant) {
          window.openAIAssistant();
        } else {
          alert('AI Assistant is loading. Please try again.');
        }
        break;
      case 'menu':
        setIsOpen(true);
        break;
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <>
      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-lg lg:hidden">
        <div className="flex justify-around items-center py-3 px-4">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.name}
              onClick={() => handleAction(action.action)}
              className="flex flex-col items-center gap-1 p-2 rounded-xl transition-all active:scale-95"
              style={{ color: action.color }}
            >
              <span className="text-2xl">{action.icon}</span>
              <span className="text-xs font-medium">{action.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Full Screen Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 lg:hidden"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed top-0 left-0 bottom-0 z-50 w-80 bg-white dark:bg-gray-900 shadow-2xl lg:hidden flex flex-col"
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  SheetInvoicer
                </div>
                <p className="text-xs text-gray-500 mt-1">AI-Powered Invoicing</p>
              </div>
              <div className="flex-1 overflow-y-auto py-4">
                {MENU_ITEMS.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-4 px-6 py-3 mx-3 rounded-xl transition-all ${
                      pathname === item.href
                        ? 'bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <span className={`font-medium ${pathname === item.href ? 'text-purple-600 dark:text-purple-400' : 'text-gray-700 dark:text-gray-300'}`}>
                      {item.name}
                    </span>
                    {pathname === item.href && (
                      <motion.div
                        layoutId="active-indicator"
                        className="ml-auto w-2 h-2 rounded-full bg-purple-600"
                      />
                    )}
                  </Link>
                ))}
              </div>
              <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all"
                >
                  <span className="text-xl">🚪</span>
                  <span>Logout</span>
                </button>
                <div className="text-center text-xs text-gray-500 mt-4">
                  Version 2.0.0 | © 2026
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Search Modal - IMPROVED */}
      <AnimatePresence>
        {isSearchOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setIsSearchOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 rounded-t-2xl shadow-2xl lg:hidden max-h-[80vh] flex flex-col"
            >
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search invoices or clients..."
                      className="w-full p-3 pl-10 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                      autoFocus
                    />
                  </div>
                  <button
                    onClick={() => setIsSearchOpen(false)}
                    className="px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4">
                {searching && (
                  <div className="text-center text-gray-500 py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-3"></div>
                    Searching...
                  </div>
                )}
                
                {!searching && searchQuery.length >= 2 && searchResults.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    <div className="text-4xl mb-2">🔍</div>
                    <p>No results found for "{searchQuery}"</p>
                    <p className="text-sm mt-2">Try searching by invoice number or client name</p>
                  </div>
                )}
                
                {!searching && searchResults.length > 0 && (
                  <div className="space-y-2">
                    {searchResults.map((result) => (
                      <button
                        key={`${result.type}-${result.id}`}
                        onClick={() => {
                          router.push(result.link);
                          setIsSearchOpen(false);
                          setSearchQuery('');
                        }}
                        className="w-full text-left p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all flex items-center gap-3"
                      >
                        <span className="text-2xl">{result.icon}</span>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-white">{result.title}</div>
                          <div className="text-xs text-gray-500">{result.subtitle}</div>
                        </div>
                        <span className="text-gray-400">→</span>
                      </button>
                    ))}
                  </div>
                )}
                
                {!searching && searchQuery.length > 0 && searchQuery.length < 2 && (
                  <div className="text-center text-gray-500 py-8">
                    Type at least 2 characters to search
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
