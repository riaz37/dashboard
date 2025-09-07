'use client';

import { Sidebar } from './sidebar';
import { Header } from './header';
import { useUIStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { sidebarOpen } = useUIStore();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div
        className={cn(
          'transition-all duration-200 ease-in-out',
          sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'
        )}
      >
        <Header />
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
