import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
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
  holiday: "📁",
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

export default function News() {
  const {
    groupedEvents,
    isLoading,
    error,
    selectedCurrency,
    setSelectedCurrency,
    weekOffset,
    weekRange,
    goNextWeek,
    goPrevWeek,
    goCurrentWeek,
  } = useEconomicCalendar();

  const dateKeys = Object.keys(groupedEvents);

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Economic Calendar</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {weekRange.from} – {weekRange.to}
            </p>
          </div>
          {/* Week Navigation */}
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="sm" className="h-8 px-2.5" onClick={goPrevWeek}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Prev
            </Button>
            {weekOffset !== 0 && (
              <Button variant="outline" size="sm" className="h-8 px-2.5" onClick={goCurrentWeek}>
                Today
              </Button>
            )}
            <Button variant="outline" size="sm" className="h-8 px-2.5" onClick={goNextWeek}>
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
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
                <p className="text-muted-foreground">
                  No economic events for this week.
                  {weekOffset !== 0 && (
                    <> <span className="text-xs">(Note: the free data source only provides the current week's data)</span></>
                  )}
                </p>
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
                                : ev.impact === "holiday"
                                ? "bg-muted/30 hover:bg-muted/50"
                                : undefined
                            }
                          >
                            <TableCell className="py-2 text-xs text-muted-foreground font-mono">
                              {ev.impact === "holiday" ? "All Day" : ev.time}
                            </TableCell>
                            <TableCell className="py-2">
                              <span className="text-xs font-semibold">{ev.country}</span>
                            </TableCell>
                            <TableCell className="py-2 text-center">
                              {impactIcons[ev.impact]}
                            </TableCell>
                            <TableCell className="py-2 text-sm font-medium text-foreground">
                              {ev.title}
                            </TableCell>
                            <TableCell className="py-2 text-right text-xs font-mono">
                              {ev.actual ? (
                                <span className={
                                  ev.forecast && ev.actual !== ev.forecast
                                    ? parseFloat(ev.actual) > parseFloat(ev.forecast)
                                      ? "text-green-600 font-semibold"
                                      : "text-red-500 font-semibold"
                                    : ""
                                }>
                                  {ev.actual}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell className="py-2 text-right text-xs font-mono text-muted-foreground">
                              {ev.forecast || "—"}
                            </TableCell>
                            <TableCell className="py-2 text-right text-xs font-mono text-muted-foreground">
                              {ev.previous || "—"}
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
