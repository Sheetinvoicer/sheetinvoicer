'use client';
import { TooltipProvider } from '@/components/Tooltip';
import Sidebar from '@/components/Sidebar';
import AIAssistant from '@/components/AIAssistant';
import SearchBar from '@/components/SearchBar';

export default function DashboardLayout({ children }) {
  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main content */}
        <div className="lg:ml-72">
          {/* Top bar */}
          <div className="sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
            <div className="flex justify-end items-center px-6 py-3">
              <SearchBar />
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
