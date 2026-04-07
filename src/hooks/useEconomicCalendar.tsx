import { useState, useEffect, useMemo, useCallback } from "react";
import { format, parseISO, isToday, isTomorrow, isYesterday, startOfWeek, endOfWeek, addWeeks } from "date-fns";

export type ImpactLevel = "high" | "medium" | "low" | "holiday";

export interface EconomicEvent {
  id: string;
  title: string;
  country: string;
  date: string;
  time: string;
  impact: ImpactLevel;
  actual: string;
  forecast: string;
  previous: string;
}

function mapImpact(impact: string): ImpactLevel {
  const lower = impact.toLowerCase();
  if (lower === "high") return "high";
  if (lower === "medium") return "medium";
  if (lower === "low") return "low";
  if (lower === "holiday") return "holiday";
  return "low";
}

export function useEconomicCalendar() {
  const [events, setEvents] = useState<EconomicEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<string | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);

  const weekRange = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(addWeeks(now, weekOffset), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(addWeeks(now, weekOffset), { weekStartsOn: 1 });
    return {
      from: format(weekStart, "MMM d"),
      to: format(weekEnd, "MMM d, yyyy"),
      label: weekOffset === 0 ? "This Week" : weekOffset === 1 ? "Next Week" : weekOffset === -1 ? "Last Week" : `Week of ${format(weekStart, "MMM d")}`,
    };
  }, [weekOffset]);

  useEffect(() => {
    async function fetchCalendar() {
      setIsLoading(true);
      setError(null);
      try {
        const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
        const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
        const url = `https://${projectId}.supabase.co/functions/v1/economic-calendar?offset=${weekOffset}`;

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${anonKey}`,
            apikey: anonKey,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch economic calendar");

        const json = await response.json();
        const raw: any[] = json.events || json;

        const mapped: EconomicEvent[] = raw.map((item, i) => {
          const dateObj = item.date ? parseISO(item.date) : null;
          const dateStr = dateObj ? format(dateObj, "yyyy-MM-dd") : "";
          const timeStr = dateObj ? format(dateObj, "h:mma").toLowerCase() : "All Day";

          return {
            id: `${item.title}-${item.country}-${i}`,
            title: item.title || "Unknown",
            country: item.country || "",
            date: dateStr,
            time: timeStr,
            impact: mapImpact(item.impact || "low"),
            actual: item.actual || "",
            forecast: item.forecast || "",
            previous: item.previous || "",
          };
        });

        mapped.sort((a, b) => {
          const d = a.date.localeCompare(b.date);
          if (d !== 0) return d;
          return a.time.localeCompare(b.time);
        });

        setEvents(mapped);
      } catch (err: any) {
        console.error("Economic calendar fetch error:", err);
        setError(err.message || "Unable to load calendar");
      } finally {
        setIsLoading(false);
      }
    }

    fetchCalendar();
  }, [weekOffset]);

  // Auto-refresh every 60 seconds for actual data updates
  useEffect(() => {
    if (weekOffset !== 0) return;
    const interval = setInterval(() => {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      const url = `https://${projectId}.supabase.co/functions/v1/economic-calendar?offset=0`;

      fetch(url, {
        headers: { Authorization: `Bearer ${anonKey}`, apikey: anonKey },
      })
        .then((r) => r.json())
        .then((json) => {
          const raw: any[] = json.events || json;
          const mapped: EconomicEvent[] = raw.map((item, i) => {
            const dateObj = item.date ? parseISO(item.date) : null;
            const dateStr = dateObj ? format(dateObj, "yyyy-MM-dd") : "";
            const timeStr = dateObj ? format(dateObj, "h:mma").toLowerCase() : "All Day";
            return {
              id: `${item.title}-${item.country}-${i}`,
              title: item.title || "Unknown",
              country: item.country || "",
              date: dateStr,
              time: timeStr,
              impact: mapImpact(item.impact || "low"),
              actual: item.actual || "",
              forecast: item.forecast || "",
              previous: item.previous || "",
            };
          });
          mapped.sort((a, b) => {
            const d = a.date.localeCompare(b.date);
            if (d !== 0) return d;
            return a.time.localeCompare(b.time);
          });
          setEvents(mapped);
        })
        .catch(() => {});
    }, 60000);
    return () => clearInterval(interval);
  }, [weekOffset]);

  const filteredEvents = useMemo(() => {
    if (!selectedCurrency) return events;
    return events.filter((e) => e.country === selectedCurrency);
  }, [events, selectedCurrency]);

  const groupedEvents = useMemo(() => {
    const groups: Record<string, EconomicEvent[]> = {};
    for (const ev of filteredEvents) {
      const key = ev.date || "Unknown";
      if (!groups[key]) groups[key] = [];
      groups[key].push(ev);
    }
    return groups;
  }, [filteredEvents]);

  const goNextWeek = useCallback(() => setWeekOffset((o) => o + 1), []);
  const goPrevWeek = useCallback(() => setWeekOffset((o) => o - 1), []);
  const goCurrentWeek = useCallback(() => setWeekOffset(0), []);

  return {
    events: filteredEvents,
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
  };
}
