import { useState, useEffect, useMemo } from "react";
import { format, parseISO, isToday, isTomorrow, isYesterday } from "date-fns";

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

  useEffect(() => {
    async function fetchCalendar() {
      setIsLoading(true);
      setError(null);
      try {
        const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
        const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
        const url = `https://${projectId}.supabase.co/functions/v1/economic-calendar`;

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${anonKey}`,
            apikey: anonKey,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch economic calendar");

        const raw: any[] = await response.json();

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

        // Sort by date then time
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
  }, []);

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

  return {
    events: filteredEvents,
    groupedEvents,
    isLoading,
    error,
    selectedCurrency,
    setSelectedCurrency,
  };
}
