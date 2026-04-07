import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEconomicCalendar, type ImpactLevel } from "@/hooks/useEconomicCalendar";
import { format, parseISO, isToday, isTomorrow, isYesterday } from "date-fns";

const CURRENCIES = ["USD", "EUR", "GBP", "JPY", "AUD", "CAD", "NZD", "CHF", "CNY"];

const impactIcons: Record<ImpactLevel, string> = {
  high: "🔴",
  medium: "🟡",
  low: "🟢",
};

function formatDateLabel(dateStr: string): string {
  try {
    const date = parseISO(dateStr);
    if (isToday(date)) return `Today — ${format(date, "EEE, MMM d")}`;
    if (isTomorrow(date)) return `Tomorrow — ${format(date, "EEE, MMM d")}`;
    if (isYesterday(date)) return `Yesterday — ${format(date, "EEE, MMM d")}`;
    return format(date, "EEE, MMM d");
  } catch {
    return dateStr;
  }
}

function formatTime(time: string): string {
  if (!time || time === "All Day") return "All Day";
  // time comes as HH:mm:ss or HH:mm
  try {
    const [h, m] = time.split(":");
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? "pm" : "am";
    const h12 = hour % 12 || 12;
    return `${h12}:${m}${ampm}`;
  } catch {
    return time;
  }
}

export default function News() {
  const {
    groupedEvents,
    isLoading,
    error,
    selectedCurrency,
    setSelectedCurrency,
  } = useEconomicCalendar();

  const dateKeys = Object.keys(groupedEvents);

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Economic Calendar</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Upcoming and recent economic events
          </p>
        </div>

        {/* Legend + Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3 text-xs mr-4">
            <span>🔴 High</span>
            <span>🟡 Medium</span>
            <span>🟢 Low</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Button
              variant={selectedCurrency === null ? "default" : "outline"}
              size="sm"
              className="h-7 text-xs px-2.5"
              onClick={() => setSelectedCurrency(null)}
            >
              All
            </Button>
            {CURRENCIES.map((c) => (
              <Button
                key={c}
                variant={selectedCurrency === c ? "default" : "outline"}
                size="sm"
                className="h-7 text-xs px-2.5"
                onClick={() => setSelectedCurrency(c === selectedCurrency ? null : c)}
              >
                {c}
              </Button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <Card className="border-destructive/50">
            <CardContent className="p-6 text-center text-destructive">
              Unable to load economic calendar. Please try again later.
            </CardContent>
          </Card>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        )}

        {/* Calendar Table */}
        {!isLoading && !error && (
          dateKeys.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CalendarDays className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No economic events match your filters.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {dateKeys.map((dateKey) => (
                <Card key={dateKey} className="overflow-hidden">
                  <div className="bg-muted/60 px-4 py-2 border-b">
                    <h2 className="text-sm font-semibold text-foreground">
                      {formatDateLabel(dateKey)}
                    </h2>
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="text-xs">
                          <TableHead className="w-[80px]">Time</TableHead>
                          <TableHead className="w-[60px]">Ccy</TableHead>
                          <TableHead className="w-[40px] text-center">Impact</TableHead>
                          <TableHead>Event</TableHead>
                          <TableHead className="w-[80px] text-right">Actual</TableHead>
                          <TableHead className="w-[80px] text-right">Forecast</TableHead>
                          <TableHead className="w-[80px] text-right">Previous</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {groupedEvents[dateKey].map((ev) => (
                          <TableRow
                            key={ev.id}
                            className={
                              ev.impact === "high"
                                ? "bg-red-500/5 hover:bg-red-500/10"
                                : undefined
                            }
                          >
                            <TableCell className="py-2 text-xs text-muted-foreground font-mono">
                              {formatTime(ev.time)}
                            </TableCell>
                            <TableCell className="py-2">
                              <span className="text-xs font-semibold">{ev.currency}</span>
                            </TableCell>
                            <TableCell className="py-2 text-center">
                              {impactIcons[ev.impact]}
                            </TableCell>
                            <TableCell className="py-2 text-sm font-medium text-foreground">
                              {ev.event}
                            </TableCell>
                            <TableCell className="py-2 text-right text-xs font-mono">
                              {ev.actual != null ? (
                                <span className={
                                  ev.estimate != null && ev.actual !== ev.estimate
                                    ? parseFloat(ev.actual) > parseFloat(ev.estimate)
                                      ? "text-green-600 font-semibold"
                                      : "text-red-500 font-semibold"
                                    : ""
                                }>
                                  {ev.actual}{ev.unit}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell className="py-2 text-right text-xs font-mono text-muted-foreground">
                              {ev.estimate != null ? `${ev.estimate}${ev.unit}` : "—"}
                            </TableCell>
                            <TableCell className="py-2 text-right text-xs font-mono text-muted-foreground">
                              {ev.prev != null ? `${ev.prev}${ev.unit}` : "—"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </Card>
              ))}
            </div>
          )
        )}
      </div>
    </DashboardLayout>
  );
}
