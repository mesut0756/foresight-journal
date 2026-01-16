import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTrades } from "@/hooks/useTrades";
import { cn } from "@/lib/utils";

interface DayData {
  date: Date;
  pnl: number;
  trades: number;
  isCurrentMonth: boolean;
}

export function MonthlyCalendar() {
  const { trades } = useTrades();
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthYear = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Calculate daily P&L from trades
  const dailyPnL = useMemo(() => {
    const pnlMap: Record<string, { pnl: number; trades: number }> = {};
    
    trades.forEach(trade => {
      if (trade.profit_loss !== null && trade.result) {
        const date = new Date(trade.created_at).toISOString().split('T')[0];
        if (!pnlMap[date]) {
          pnlMap[date] = { pnl: 0, trades: 0 };
        }
        pnlMap[date].pnl += trade.profit_loss;
        pnlMap[date].trades++;
      }
    });
    
    return pnlMap;
  }, [trades]);

  // Generate calendar data
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    const startDay = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();
    
    const days: DayData[] = [];
    
    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      const dateKey = date.toISOString().split('T')[0];
      days.push({
        date,
        pnl: dailyPnL[dateKey]?.pnl || 0,
        trades: dailyPnL[dateKey]?.trades || 0,
        isCurrentMonth: false,
      });
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateKey = date.toISOString().split('T')[0];
      days.push({
        date,
        pnl: dailyPnL[dateKey]?.pnl || 0,
        trades: dailyPnL[dateKey]?.trades || 0,
        isCurrentMonth: true,
      });
    }
    
    // Next month days to fill the grid
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      const dateKey = date.toISOString().split('T')[0];
      days.push({
        date,
        pnl: dailyPnL[dateKey]?.pnl || 0,
        trades: dailyPnL[dateKey]?.trades || 0,
        isCurrentMonth: false,
      });
    }
    
    return days;
  }, [currentDate, dailyPnL]);

  // Calculate monthly totals
  const monthlyTotal = useMemo(() => {
    return calendarDays
      .filter(day => day.isCurrentMonth)
      .reduce((sum, day) => sum + day.pnl, 0);
  }, [calendarDays]);

  const monthlyTrades = useMemo(() => {
    return calendarDays
      .filter(day => day.isCurrentMonth)
      .reduce((sum, day) => sum + day.trades, 0);
  }, [calendarDays]);

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-card rounded-xl border border-border p-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Monthly Calendar</h3>
          <p className="text-sm text-muted-foreground">Daily P&L breakdown</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium text-foreground min-w-[140px] text-center">
            {monthYear}
          </span>
          <Button variant="outline" size="icon" onClick={goToNextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Monthly Summary */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="p-3 rounded-lg bg-secondary/30 border border-border">
          <p className="text-sm text-muted-foreground">Monthly P&L</p>
          <p className={cn(
            "text-xl font-mono font-semibold",
            monthlyTotal > 0 ? "text-primary" : monthlyTotal < 0 ? "text-destructive" : "text-foreground"
          )}>
            {monthlyTotal >= 0 ? '+' : ''}${monthlyTotal.toFixed(2)}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-secondary/30 border border-border">
          <p className="text-sm text-muted-foreground">Closed Trades</p>
          <p className="text-xl font-mono font-semibold text-foreground">{monthlyTrades}</p>
        </div>
      </div>

      {/* Week day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => (
          <div
            key={index}
            className={cn(
              "relative p-2 rounded-lg min-h-[70px] border transition-colors",
              day.isCurrentMonth ? "bg-secondary/20 border-border" : "bg-muted/30 border-transparent",
              isToday(day.date) && "ring-2 ring-primary",
              day.pnl > 0 && day.isCurrentMonth && "bg-primary/10 border-primary/30",
              day.pnl < 0 && day.isCurrentMonth && "bg-destructive/10 border-destructive/30"
            )}
          >
            <span className={cn(
              "text-xs font-medium",
              day.isCurrentMonth ? "text-foreground" : "text-muted-foreground",
              isToday(day.date) && "text-primary font-bold"
            )}>
              {day.date.getDate()}
            </span>
            
            {day.trades > 0 && (
              <div className="mt-1">
                <p className={cn(
                  "text-xs font-mono font-semibold",
                  day.pnl > 0 ? "text-primary" : day.pnl < 0 ? "text-destructive" : "text-muted-foreground"
                )}>
                  {day.pnl >= 0 ? '+' : ''}${day.pnl.toFixed(0)}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {day.trades} trade{day.trades !== 1 ? 's' : ''}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
