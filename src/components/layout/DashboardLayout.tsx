import { useState } from "react";
import { Sidebar, MobileHeader } from "./Sidebar";
import { BottomNav } from "./BottomNav";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Mobile Header */}
      <MobileHeader onToggle={toggleSidebar} />
      
      {/* Sidebar - hidden on mobile, visible on lg */}
      <div className="hidden lg:block">
        <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
      </div>
      
      {/* Main Content - Scrollable */}
      <main className="flex-1 overflow-auto h-screen pt-14 lg:pt-0 pb-20 lg:pb-0">
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>

      {/* Bottom Nav - visible on mobile only */}
      <BottomNav />
    </div>
  );
}
