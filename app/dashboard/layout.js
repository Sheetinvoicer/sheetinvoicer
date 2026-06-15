'use client';
import Sidebar from '@/components/Sidebar';
import SearchBar from '@/components/SearchBar';
import AIAssistant from '@/components/AIAssistant';
import { useState, useEffect } from 'react';

export default function DashboardLayout({ children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <Sidebar />
      <div className="flex-1">
        {/* Top Bar with Search */}
        <div className="sticky top-0 z-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="flex justify-end items-center px-6 py-3">
            <SearchBar />
          </div>
        </div>
        
        {/* Main Content */}
        <main className="p-4 md:p-6">
          {children}
        </main>
      </div>
      <AIAssistant />
    </div>
  );
}
