import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  PlusCircle,
  BookOpen,
  BarChart3,
  MoreHorizontal,
  Lightbulb,
  PieChart,
  Shield,
  Settings,
  ArrowLeftRight,
  Newspaper,
  X,
} from "lucide-react";

const mainLinks = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/add-trade", label: "Add", icon: PlusCircle },
  { to: "/journal", label: "Journal", icon: BookOpen },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
];

const moreLinks = [
  { to: "/news", label: "News", icon: Newspaper },
  { to: "/transactions", label: "Funds", icon: ArrowLeftRight },
  { to: "/strategies", label: "Strategies", icon: Lightbulb },
  { to: "/pairs-analysis", label: "Pairs", icon: PieChart },
  { to: "/risk-management", label: "Risk", icon: Shield },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function BottomNav() {
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;
  const isMoreActive = moreLinks.some((l) => isActive(l.to));

  return (
    <>
      {/* More menu overlay */}
      {moreOpen && (
        <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setMoreOpen(false)} />
      )}

      {/* More menu popup */}
      {moreOpen && (
        <div className="fixed bottom-16 left-0 right-0 z-50 px-3 pb-2">
          <div className="bg-card border border-border rounded-xl shadow-lg p-3 grid grid-cols-4 gap-2">
            {moreLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMoreOpen(false)}
                className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg transition-colors ${
                  isActive(link.to)
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <link.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{link.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Bottom nav bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border h-16 flex items-center justify-around px-2 lg:hidden">
        {mainLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-colors ${
              isActive(link.to)
                ? "text-primary"
                : "text-muted-foreground"
            }`}
          >
            <link.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{link.label}</span>
          </Link>
        ))}
        <button
          onClick={() => setMoreOpen(!moreOpen)}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-colors ${
            moreOpen || isMoreActive
              ? "text-primary"
              : "text-muted-foreground"
          }`}
        >
          {moreOpen ? <X className="w-5 h-5" /> : <MoreHorizontal className="w-5 h-5" />}
          <span className="text-[10px] font-medium">More</span>
        </button>
      </nav>
    </>
  );
}
