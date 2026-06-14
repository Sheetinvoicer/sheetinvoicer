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
      {/* Sidebar - fixed position on desktop */}
      <div className="hidden lg:block fixed left-0 top-0 h-full z-30">
        <Sidebar />
      </div>
      
      {/* Main content - pushes right to account for sidebar */}
      <div className="lg:ml-72">
        {/* Mobile menu button - only on mobile */}
        {isMobile && <MobileMenu />}
        
        {/* Main content area */}
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
