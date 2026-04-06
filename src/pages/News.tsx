import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, Newspaper } from "lucide-react";
import { useNews, getImpactLevel, type ImpactLevel } from "@/hooks/useNews";
import { formatDistanceToNow } from "date-fns";

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

function NewsCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <div className="flex gap-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-24" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function News() {
  const {
    articles,
    isLoading,
    error,
    selectedCurrency,
    setSelectedCurrency,
    highImpactOnly,
    setHighImpactOnly,
  } = useNews();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Forex News</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Stay informed with the latest market-moving news
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

        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Currency filters */}
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

          {/* High impact toggle */}
          <div className="flex items-center gap-2 sm:ml-auto">
            <Switch
              checked={highImpactOnly}
              onCheckedChange={setHighImpactOnly}
              id="high-impact"
            />
            <label htmlFor="high-impact" className="text-sm font-medium cursor-pointer select-none">
              High Impact Only
            </label>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <Card className="border-destructive/50">
            <CardContent className="p-6 text-center text-destructive">
              Unable to load news. Please try again later.
            </CardContent>
          </Card>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="grid gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <NewsCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Articles */}
        {!isLoading && !error && (
          <div className="grid gap-4">
            {articles.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Newspaper className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No news articles match your filters.</p>
                </CardContent>
              </Card>
            ) : (
              articles.map((article) => {
                const impact = getImpactLevel(article.title, article.description);
                return (
                  <a
                    key={article.id}
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block group"
                  >
                    <Card className="transition-shadow hover:shadow-md">
                      <CardContent className="p-4 sm:p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0 space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <ImpactBadge level={impact} />
                              <div className="flex gap-1">
                                {article.currencies.map((c) => (
                                  <Badge key={c} className="text-[10px] px-1.5 py-0 bg-muted text-muted-foreground border-0">
                                    {c}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                              {article.title}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {article.description}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="font-medium">{article.source}</span>
                              <span>•</span>
                              <span>
                                {formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}
                              </span>
                            </div>
                          </div>
                          <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </CardContent>
                    </Card>
                  </a>
                );
              })
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
