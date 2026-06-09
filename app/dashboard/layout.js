'use client';

import GlassSidebar from '@/components/GlassSidebar';
import AIAssistant from '@/components/AIAssistant';

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <GlassSidebar />
      <main className="lg:ml-72">
        {children}
      </main>
      <AIAssistant />
    </div>
  );
}
