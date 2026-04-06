import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays } from "lucide-react";
import { useEconomicCalendar, type ImpactLevel } from "@/hooks/useEconomicCalendar";
import { format } from "date-fns";

const CURRENCIES = ["USD", "EUR", "GBP", "JPY", "AUD", "CAD"];

const impactConfig: Record<ImpactLevel, { icon: string; label: string; color: string; description: string }> = {
  high: { icon: "🔴", label: "High Impact", color: "text-red-500", description: "Likely to move the market significantly" },
  medium: { icon: "🟡", label: "Medium Impact", color: "text-yellow-500", description: "Moderate effect on the market" },
  low: { icon: "🟢", label: "Low Impact", color: "text-green-500", description: "Minor effect on the market" },
};

function ImpactBadge({ level }: { level: ImpactLevel }) {
  const config = impactConfig[level];
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium">
      <span>{config.icon}</span>
      <span className={config.color}>{config.label}</span>
    </span>
  );
}

function EventCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <div className="flex gap-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-24" />
        </div>
      </CardContent>
    </Card>
  );
}

function DataCell({ label, value, unit }: { label: string; value: number | null; unit: string }) {
  return (
    <div className="text-center">
      <p className="text-[10px] uppercase text-muted-foreground tracking-wider">{label}</p>
      <p className="text-sm font-semibold text-foreground">
        {value !== null ? `${value}${unit ? ` ${unit}` : ""}` : "—"}
      </p>
    </div>
  );
}

export default function News() {
  const {
    events,
    isLoading,
    error,
    selectedCurrency,
    setSelectedCurrency,
  } = useEconomicCalendar();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Economic Calendar</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Real-time economic events and data releases
          </p>
        </div>

        {/* Impact Legend */}
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Impact Legend
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-1">
              {(["high", "medium", "low"] as ImpactLevel[]).map((level) => (
                <div key={level} className="flex items-center gap-1.5 text-sm">
                  <span>{impactConfig[level].icon}</span>
                  <span className="font-medium">{impactConfig[level].label}</span>
                  <span className="text-muted-foreground hidden sm:inline">
                    – {impactConfig[level].description}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Currency Filters */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCurrency === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCurrency(null)}
          >
            All
          </Button>
          {CURRENCIES.map((c) => (
            <Button
              key={c}
              variant={selectedCurrency === c ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCurrency(c === selectedCurrency ? null : c)}
            >
              {c}
            </Button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <Card className="border-destructive/50">
            <CardContent className="p-6 text-center text-destructive">
              {error}
            </CardContent>
          </Card>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="grid gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <EventCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Events */}
        {!isLoading && !error && (
          <div className="grid gap-3">
            {events.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <CalendarDays className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No economic events match your filters.</p>
                </CardContent>
              </Card>
            ) : (
              events.map((event) => (
                <Card key={event.id} className="transition-shadow hover:shadow-md">
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <ImpactBadge level={event.impact} />
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                            {event.currency}
                          </span>
                        </div>
                        <h3 className="font-semibold text-foreground line-clamp-2">
                          {event.event}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {event.time
                            ? format(new Date(event.time), "MMM d, yyyy · h:mm a")
                            : "Time TBD"}
                        </p>
                      </div>
                      <div className="flex gap-4 sm:gap-6 shrink-0">
                        <DataCell label="Actual" value={event.actual} unit={event.unit} />
                        <DataCell label="Forecast" value={event.estimate} unit={event.unit} />
                        <DataCell label="Previous" value={event.prev} unit={event.unit} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
