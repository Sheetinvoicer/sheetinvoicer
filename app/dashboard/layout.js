'use client';
import Sidebar from '@/components/Sidebar';
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="lg:ml-64">
        <main className="min-h-screen">
          <div className="p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>
      <AIAssistant />
    </div>
  );
}
