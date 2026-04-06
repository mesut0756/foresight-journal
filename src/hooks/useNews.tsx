import { useState, useMemo } from "react";
import { mockNewsArticles, type NewsArticle } from "@/data/mockNews";

export type ImpactLevel = "high" | "medium" | "low";

const HIGH_KEYWORDS = ["interest rate", "inflation", "nfp", "cpi", "fomc"];
const MEDIUM_KEYWORDS = ["gdp", "employment", "retail sales"];

export function getImpactLevel(title: string, description: string): ImpactLevel {
  const text = `${title} ${description}`.toLowerCase();
  if (HIGH_KEYWORDS.some((k) => text.includes(k))) return "high";
  if (MEDIUM_KEYWORDS.some((k) => text.includes(k))) return "medium";
  return "low";
}

export function useNews() {
  const [selectedCurrency, setSelectedCurrency] = useState<string | null>(null);
  const [highImpactOnly, setHighImpactOnly] = useState(false);
  const [isLoading] = useState(false);
  const [error] = useState<string | null>(null);

  const articles = useMemo(() => {
    let filtered = mockNewsArticles;

    if (selectedCurrency) {
      filtered = filtered.filter((a) => a.currencies.includes(selectedCurrency));
    }

    if (highImpactOnly) {
      filtered = filtered.filter(
        (a) => getImpactLevel(a.title, a.description) === "high"
      );
    }

    return filtered;
  }, [selectedCurrency, highImpactOnly]);

  return {
    articles,
    isLoading,
    error,
    selectedCurrency,
    setSelectedCurrency,
    highImpactOnly,
    setHighImpactOnly,
  };
}
