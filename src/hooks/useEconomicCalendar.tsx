import { useState, useEffect, useMemo } from "react";
import { format, addDays, subDays } from "date-fns";

export type ImpactLevel = "high" | "medium" | "low";

export interface EconomicEvent {
  id: string;
  event: string;
  country: string;
  currency: string;
  date: string;
  time: string;
  impact: ImpactLevel;
  actual: string | null;
  estimate: string | null;
  prev: string | null;
  unit: string;
}

const HIGH_KEYWORDS = [
  "interest rate", "inflation", "cpi", "nfp", "non-farm", "fomc",
  "central bank", "rate decision", "monetary policy", "rate cut", "rate hike",
  "gdp", "employment change", "unemployment rate", "retail sales",
  "pmi", "ism", "president", "chairman", "governor speaks",
];

const MEDIUM_KEYWORDS = [
  "trade balance", "consumer confidence", "housing", "jobs",
  "payroll", "ppi", "industrial production", "manufacturing",
  "building permits", "durable goods", "existing home",
];

const COUNTRY_TO_CURRENCY: Record<string, string> = {
  US: "USD", EU: "EUR", GB: "GBP", JP: "JPY", AU: "AUD", CA: "CAD",
  NZ: "NZD", CH: "CHF", CN: "CNY", DE: "EUR", FR: "EUR", IT: "EUR",
  ES: "EUR",
};

function inferImpact(event: string, apiImpact?: string): ImpactLevel {
  if (apiImpact === "high") return "high";
  if (apiImpact === "medium") return "medium";
  if (apiImpact === "low") return "low";

  const lower = event.toLowerCase();
  if (HIGH_KEYWORDS.some((k) => lower.includes(k))) return "high";
  if (MEDIUM_KEYWORDS.some((k) => lower.includes(k))) return "medium";
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
        const today = new Date();
        const from = format(subDays(today, 3), "yyyy-MM-dd");
        const to = format(addDays(today, 7), "yyyy-MM-dd");

        const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
        const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
        const url = `https://${projectId}.supabase.co/functions/v1/economic-calendar?from=${from}&to=${to}`;

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${anonKey}`,
            apikey: anonKey,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch economic calendar");

        const data = await response.json();
        const raw: any[] = data?.economicCalendar || [];

        const mapped: EconomicEvent[] = raw.map((item, i) => ({
          id: `${item.event}-${item.country}-${i}`,
          event: item.event || "Unknown Event",
          country: item.country || "",
          currency: COUNTRY_TO_CURRENCY[item.country] || item.country || "OTHER",
          date: item.time ? item.time.split(" ")[0] : "",
          time: item.time ? item.time.split(" ")[1] || "All Day" : "All Day",
          impact: inferImpact(item.event || "", item.impact),
          actual: item.actual != null ? String(item.actual) : null,
          estimate: item.estimate != null ? String(item.estimate) : null,
          prev: item.prev != null ? String(item.prev) : null,
          unit: item.unit || "",
        }));

        mapped.sort((a, b) => {
          const dateComp = a.date.localeCompare(b.date);
          if (dateComp !== 0) return dateComp;
          if (a.time === "All Day") return -1;
          if (b.time === "All Day") return 1;
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
    return events.filter((e) => e.currency === selectedCurrency);
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
