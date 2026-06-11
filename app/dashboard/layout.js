'use client';

import GlassSidebar from '@/components/GlassSidebar';
import MobileMenu from '@/components/MobileMenu';
import AIAssistant from '@/components/AIAssistant';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import VersionBadge from '@/components/VersionBadge';

export default function DashboardLayout({ children }) {
  const isMobile = useMediaQuery('(max-width: 1024px)');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {!isMobile && <GlassSidebar />}
      <main className={!isMobile ? 'lg:ml-72' : 'pb-20'}>
        {children}
      </main>
      {isMobile && <MobileMenu />}
      <AIAssistant />
      <VersionBadge />
    </div>
  );
}
