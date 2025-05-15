
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Home,
  Users,
  Calendar,
  Clock,
  FileText,
  Bell,
  X,
  FilePen
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const Sidebar = ({ open, onClose }: SidebarProps) => {
  const { user } = useAuth();
  const isMobile = useIsMobile();

  // Define navigation items based on user role
  const navItems = [
    { 
      name: "Dashboard", 
      path: "/dashboard", 
      icon: <Home className="h-5 w-5" />,
      roles: ["admin", "mentor", "student"]
    },
    { 
      name: "Manage Users", 
      path: "/users", 
      icon: <Users className="h-5 w-5" />,
      roles: ["admin"]
    },
    { 
      name: "Mentees", 
      path: "/mentees", 
      icon: <Users className="h-5 w-5" />,
      roles: ["mentor"]
    },
    { 
      name: "Choose Mentor", 
      path: "/choose-mentor", 
      icon: <Users className="h-5 w-5" />,
      roles: ["student"]
    },
    { 
      name: "My Mentor", 
      path: "/my-mentor", 
      icon: <Users className="h-5 w-5" />,
      roles: ["student"]
    },
    { 
      name: "Meetings", 
      path: "/meetings", 
      icon: <Calendar className="h-5 w-5" />,
      roles: ["admin", "mentor", "student"]
    },
    { 
      name: "Session Notes", 
      path: "/session-notes", 
      icon: <FilePen className="h-5 w-5" />,
      roles: ["mentor"]
    },
    { 
      name: "Notifications", 
      path: "/notifications", 
      icon: <Bell className="h-5 w-5" />,
      roles: ["admin", "mentor", "student"]
    }
  ];

  // Filter items by user role
  const filteredNavItems = navItems.filter(
    item => user && item.roles.includes(user.role)
  );

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && open && (
        <div 
          className="fixed inset-0 z-40 bg-black/50"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r shadow-sm transition-transform duration-300 ease-in-out transform",
          isMobile 
            ? open 
              ? "translate-x-0" 
              : "-translate-x-full" 
            : "translate-x-0 pt-16 hidden md:block"
        )}
      >
        {isMobile && (
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="font-semibold text-lg">Navigation</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        )}
        
        <div className="overflow-y-auto h-full py-4">
          <nav className="space-y-1 px-2">
            {filteredNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={isMobile ? onClose : undefined}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-primary text-primary-foreground"
                    : "text-gray-700 hover:bg-muted"
                )}
              >
                {item.icon}
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
