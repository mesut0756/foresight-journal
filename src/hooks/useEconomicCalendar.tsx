import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, addDays } from "date-fns";

export type ImpactLevel = "high" | "medium" | "low";

export interface EconomicEvent {
  id: string;
  country: string;
  currency: string;
  event: string;
  time: string;
  actual: number | null;
  estimate: number | null;
  prev: number | null;
  impact: ImpactLevel;
  unit: string;
}

const HIGH_KEYWORDS = ["interest rate", "inflation", "nfp", "cpi", "fomc", "non-farm", "central bank", "rate decision", "monetary policy"];
const MEDIUM_KEYWORDS = ["gdp", "employment", "retail sales", "pmi", "trade balance", "consumer confidence", "housing"];

function inferImpact(eventName: string, apiImpact?: string): ImpactLevel {
  if (apiImpact === "high") return "high";
  if (apiImpact === "medium") return "medium";
  if (apiImpact === "low") return "low";

  const text = eventName.toLowerCase();
  if (HIGH_KEYWORDS.some((k) => text.includes(k))) return "high";
  if (MEDIUM_KEYWORDS.some((k) => text.includes(k))) return "medium";
  return "low";
}

const CURRENCY_MAP: Record<string, string> = {
  US: "USD", EU: "EUR", GB: "GBP", JP: "JPY", AU: "AUD", CA: "CAD",
  NZ: "NZD", CH: "CHF", CN: "CNY", DE: "EUR", FR: "EUR", IT: "EUR",
};

export function useEconomicCalendar() {
  const [events, setEvents] = useState<EconomicEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvents() {
      setIsLoading(true);
      setError(null);
      try {
        const today = new Date();
        const from = format(subDays(today, 3), "yyyy-MM-dd");
        const to = format(addDays(today, 7), "yyyy-MM-dd");

        const { data, error: fnError } = await supabase.functions.invoke("economic-calendar", {
          body: null,
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        // supabase.functions.invoke doesn't support query params well, use fetch directly
        const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
        const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
        const url = `https://${projectId}.supabase.co/functions/v1/economic-calendar?from=${from}&to=${to}`;

        const response = await fetch(url, {
          headers: {
            "Authorization": `Bearer ${anonKey}`,
            "apikey": anonKey,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch economic calendar");
        }

        const result = await response.json();
        const raw = result?.economicCalendar || result?.economic_calendar || [];

        const mapped: EconomicEvent[] = raw.map((item: any, idx: number) => ({
          id: `${item.country}-${item.event}-${item.time}-${idx}`,
          country: item.country || "",
          currency: CURRENCY_MAP[item.country] || item.country || "OTHER",
          event: item.event || "Unknown Event",
          time: item.time || "",
          actual: item.actual ?? null,
          estimate: item.estimate ?? null,
          prev: item.prev ?? null,
          impact: inferImpact(item.event || "", item.impact),
          unit: item.unit || "",
        }));

        // Sort: upcoming first
        mapped.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

        setEvents(mapped);
      } catch (err: any) {
        console.error("Economic calendar fetch error:", err);
        setError(err.message || "Unable to load economic calendar");
      } finally {
        setIsLoading(false);
      }
    }

    fetchEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    if (!selectedCurrency) return events;
    return events.filter((e) => e.currency === selectedCurrency);
  }, [events, selectedCurrency]);

  return {
    events: filteredEvents,
    isLoading,
    error,
    selectedCurrency,
    setSelectedCurrency,
  };
}
