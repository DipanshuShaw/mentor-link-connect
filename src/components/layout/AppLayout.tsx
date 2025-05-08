
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const isMobile = useIsMobile();

  // Close sidebar when transitioning from mobile to desktop
  useEffect(() => {
    if (!isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  // Add role-specific background color classes
  const roleClass = user?.role === 'admin' 
    ? 'bg-gradient-to-br from-slate-50 to-blue-50' 
    : user?.role === 'mentor' 
      ? 'bg-gradient-to-br from-slate-50 to-indigo-50' 
      : 'bg-gradient-to-br from-slate-50 to-violet-50';

  return (
    <div className={cn("min-h-screen flex flex-col", roleClass)}>
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className={cn(
          "flex-1 overflow-auto p-4 md:p-6 transition-all",
          isMobile ? "w-full" : "ml-0 md:ml-64"
        )}>
          <div className="max-w-7xl mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
