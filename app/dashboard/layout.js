'use client';

import Sidebar from '@/components/Sidebar';
import MobileMenu from '@/components/MobileMenu';
import AIAssistant from '@/components/AIAssistant';
import { useEffect, useState } from 'react';

export default function DashboardLayout({ children }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar - visible on desktop */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      
      {/* Mobile menu - only shown on mobile */}
      {isMobile && <MobileMenu />}
      
      {/* Main content */}
      <main className="lg:ml-72">
        <div className="p-4 md:p-6">
          {children}
        </div>
      </main>
      
      <AIAssistant />
    </div>
  );
}
