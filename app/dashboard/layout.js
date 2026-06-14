'use client';
import { TooltipProvider } from '@/components/Tooltip';
import Sidebar from '@/components/Sidebar';
import MobileMenu from '@/components/MobileMenu';
import AIAssistant from '@/components/AIAssistant';
import SearchBar from '@/components/SearchBar';
import { useEffect, useState } from 'react';

export default function DashboardLayout({ children }) {
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="hidden lg:block fixed left-0 top-0 h-full z-30">
          <Sidebar />
        </div>
        
        <div className="lg:ml-72">
          <div className="sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
            <div className="flex justify-end items-center px-6 py-3">
              <SearchBar />
            </div>
          </div>
          
          {isMobile && <MobileMenu />}
          
          <main className="min-h-screen">
            <div className="p-4 md:p-6">
              {children}
            </div>
          </main>
        </div>
        
        <AIAssistant />
      </div>
    </TooltipProvider>
  );
}