import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  PlusCircle,
  BookOpen,
  BarChart3,
  Lightbulb,
  PieChart,
  Shield,
  Settings,
  ArrowLeftRight,
  Newspaper,
  TrendingUp,
  X,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const tradingLinks = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/add-trade", label: "Add Trade", icon: PlusCircle },
  { to: "/journal", label: "Journal", icon: BookOpen },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
];

const performanceLinks = [
  { to: "/strategies", label: "Strategies", icon: Lightbulb },
  { to: "/pairs-analysis", label: "Pairs Analysis", icon: PieChart },
  { to: "/risk-management", label: "Risk Management", icon: Shield },
];

const marketLinks = [
  { to: "/news", label: "Economic Calendar", icon: Newspaper },
];

const accountLinks = [
  { to: "/transactions", label: "Deposits & Withdrawals", icon: ArrowLeftRight },
  { to: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/auth");
  };

  // Get first letter of username from email
  const getUserInitial = () => {
    if (!user?.email) return "T";
    const username = user.email.split("@")[0];
    return username.charAt(0).toUpperCase();
  };

  const getUsername = () => {
    if (!user?.email) return "Trader";
    return user.email.split("@")[0];
  };

  const NavItem = ({ to, label, icon: Icon }: { to: string; label: string; icon: React.ComponentType<{ className?: string }> }) => {
    const isActive = location.pathname === to || 
      (to === "/dashboard" && location.pathname === "/");
    
    return (
      <Link
        to={to}
        onClick={() => window.innerWidth < 1024 && onToggle()}
        className={`sidebar-item ${isActive ? "sidebar-item-active" : ""}`}
      >
        <Icon className="w-5 h-5 shrink-0" />
        <span className="font-medium">{label}</span>
      </Link>
    );
  };

  return (
    <>
      {/* Mobile/Tablet Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed top-0 left-0 z-50 h-screen w-64 bg-sidebar border-r border-sidebar-border 
          flex flex-col transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo */}
        <div className="p-6 border-b border-sidebar-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Forex Journal</h1>
              <p className="text-xs text-muted-foreground">Track your trades</p>
            </div>
          </div>
          {/* Close button for mobile/tablet */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden hover:bg-sidebar-accent"
            onClick={onToggle}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-6 overflow-y-auto scrollbar-thin">
          {/* Trading Section */}
          <div>
            <h2 className="px-4 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Trading
            </h2>
            <div className="space-y-1">
              {tradingLinks.map((link) => (
                <NavItem key={link.to} {...link} />
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="section-divider" />

          {/* Performance & Improvement Section */}
          <div>
            <h2 className="px-4 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Performance & Improvement
            </h2>
            <div className="space-y-1">
              {performanceLinks.map((link) => (
                <NavItem key={link.to} {...link} />
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="section-divider" />

          {/* Market Section */}
          <div>
            <h2 className="px-4 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Market
            </h2>
            <div className="space-y-1">
              {marketLinks.map((link) => (
                <NavItem key={link.to} {...link} />
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="section-divider" />

          {/* Account Section */}
          <div>
            <h2 className="px-4 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Account
            </h2>
            <div className="space-y-1">
              {accountLinks.map((link) => (
                <NavItem key={link.to} {...link} />
              ))}
            </div>
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-sm font-medium text-primary">{getUserInitial()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{getUsername()}</p>
              <p className="text-xs text-muted-foreground">Pro Account</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
              onClick={handleSignOut}
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}

export function MobileHeader({ onToggle }: { onToggle: () => void }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-30 h-14 bg-sidebar border-b border-sidebar-border flex items-center px-4 lg:hidden">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
          <TrendingUp className="w-4 h-4 text-primary" />
        </div>
        <span className="font-bold text-foreground">Forex Journal</span>
      </div>
    </header>
  );
}
