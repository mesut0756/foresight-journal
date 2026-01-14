import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  PlusCircle,
  BookOpen,
  BarChart3,
  Lightbulb,
  PieChart,
  Shield,
  Settings,
  TrendingUp,
} from "lucide-react";

const tradingLinks = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/add-trade", label: "Add Trade", icon: PlusCircle },
  { to: "/journal", label: "Journal", icon: BookOpen },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
];

const performanceLinks = [
  { to: "/strategies", label: "Strategies", icon: Lightbulb },
  { to: "/pairs-analysis", label: "Pairs Analysis", icon: PieChart },
  { to: "/risk-management", label: "Risk Management", icon: Shield },
];

const accountLinks = [
  { to: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const location = useLocation();

  const NavItem = ({ to, label, icon: Icon }: { to: string; label: string; icon: React.ComponentType<{ className?: string }> }) => {
    const isActive = location.pathname === to;
    
    return (
      <Link
        to={to}
        className={`sidebar-item ${isActive ? "sidebar-item-active" : ""}`}
      >
        <Icon className="w-5 h-5" />
        <span className="font-medium">{label}</span>
      </Link>
    );
  };

  return (
    <aside className="w-64 min-h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Forex Journal</h1>
            <p className="text-xs text-muted-foreground">Track your trades</p>
          </div>
        </div>
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
            <span className="text-sm font-medium text-primary">T</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">Trader</p>
            <p className="text-xs text-muted-foreground">Pro Account</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
