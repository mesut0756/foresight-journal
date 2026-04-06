import { useState, useEffect, useMemo } from "react";

export type ImpactLevel = "high" | "medium" | "low";

export interface ForexNewsItem {
  id: string;
  headline: string;
  summary: string;
  source: string;
  datetime: number;
  url: string;
  image: string;
  currency: string;
  impact: ImpactLevel;
}

const HIGH_KEYWORDS = ["interest rate", "inflation", "nfp", "cpi", "fomc", "non-farm", "central bank", "rate decision", "monetary policy", "rate cut", "rate hike"];
const MEDIUM_KEYWORDS = ["gdp", "employment", "retail sales", "pmi", "trade balance", "consumer confidence", "housing", "jobs", "payroll"];

const CURRENCY_KEYWORDS: Record<string, string[]> = {
  USD: ["usd", "dollar", "fed ", "federal reserve", "fomc", "u.s.", "us ", "united states", "treasury", "nfp", "wall street"],
  EUR: ["eur", "euro", "ecb", "european", "eurozone", "eu "],
  GBP: ["gbp", "pound", "sterling", "boe", "bank of england", "uk ", "britain", "british"],
  JPY: ["jpy", "yen", "boj", "bank of japan", "japan"],
  AUD: ["aud", "aussie", "rba", "australia", "australian"],
  CAD: ["cad", "loonie", "boc", "bank of canada", "canada", "canadian"],
};

function inferImpact(text: string): ImpactLevel {
  const lower = text.toLowerCase();
  if (HIGH_KEYWORDS.some((k) => lower.includes(k))) return "high";
  if (MEDIUM_KEYWORDS.some((k) => lower.includes(k))) return "medium";
  return "low";
}

function inferCurrency(text: string): string {
  const lower = text.toLowerCase();
  for (const [currency, keywords] of Object.entries(CURRENCY_KEYWORDS)) {
    if (keywords.some((k) => lower.includes(k))) return currency;
  }
  return "OTHER";
}

export function useForexNews() {
  const [items, setItems] = useState<ForexNewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNews() {
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

        if (!response.ok) {
          throw new Error("Failed to fetch news");
        }

        const raw: any[] = await response.json();

        const mapped: ForexNewsItem[] = raw.map((item) => {
          const text = `${item.headline || ""} ${item.summary || ""}`;
          return {
            id: String(item.id),
            headline: item.headline || "Untitled",
            summary: item.summary || "",
            source: item.source || "Unknown",
            datetime: item.datetime || 0,
            url: item.url || "#",
            image: item.image || "",
            currency: inferCurrency(text),
            impact: inferImpact(text),
          };
        });

        // Sort newest first
        mapped.sort((a, b) => b.datetime - a.datetime);
        setItems(mapped);
      } catch (err: any) {
        console.error("Forex news fetch error:", err);
        setError(err.message || "Unable to load news");
      } finally {
        setIsLoading(false);
      }
    }

    fetchNews();
  }, []);

  const filteredItems = useMemo(() => {
    if (!selectedCurrency) return items;
    return items.filter((e) => e.currency === selectedCurrency);
  }, [items, selectedCurrency]);

  return {
    items: filteredItems,
    isLoading,
    error,
    selectedCurrency,
    setSelectedCurrency,
  };
}
