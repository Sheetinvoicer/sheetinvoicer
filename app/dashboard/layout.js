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

  if (!mounted) {
    return null;
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Sidebar - hidden on mobile, visible on desktop */}
        <div className="hidden lg:block fixed left-0 top-0 h-full z-30">
          <Sidebar />
        </div>
        
        {/* Mobile menu button and overlay - only on mobile */}
        {isMobile && <MobileMenu />}
        
        {/* Main content - pushes right on desktop only */}
        <div className="lg:ml-72">
          {/* Top bar */}
          <div className="sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
            <div className="flex justify-between items-center px-4 py-3">
              {/* Mobile menu button for small screens */}
              {isMobile && (
                <button
                  onClick={() => {
                    const event = new CustomEvent('toggleMobileMenu');
                    window.dispatchEvent(event);
                  }}
                  className="lg:hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-800"
                >
                  ☰
                </button>
              )}
              <div className="flex-1 flex justify-end">
                <SearchBar />
              </div>
            </div>
          </div>
          
          {/* Page content */}
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
