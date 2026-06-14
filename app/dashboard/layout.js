'use client';
import Sidebar from '@/components/Sidebar';
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
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="lg:ml-72">
        <main className="min-h-screen">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
import LanguageSwitcher from '@/components/LanguageSwitcher';
// Add this to the top bar in the return statement
