export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  source: string;
  publishedAt: string;
  url: string;
  currencies: string[];
}

export const mockNewsArticles: NewsArticle[] = [
  {
    id: "1",
    title: "Federal Reserve Signals Potential Interest Rate Cut in September",
    description: "The Federal Reserve hinted at a possible interest rate reduction during its latest FOMC meeting, citing cooling inflation and a softening labor market. Markets reacted strongly with USD weakening across the board.",
    source: "Reuters",
    publishedAt: "2026-04-06T14:30:00Z",
    url: "#",
    currencies: ["USD"],
  },
  {
    id: "2",
    title: "ECB Holds Rates Steady Amid Persistent Inflation Concerns",
    description: "The European Central Bank decided to keep interest rates unchanged, stating that inflation remains above target. EUR/USD saw mild volatility following the announcement.",
    source: "Bloomberg",
    publishedAt: "2026-04-06T12:15:00Z",
    url: "#",
    currencies: ["EUR", "USD"],
  },
  {
    id: "3",
    title: "UK GDP Growth Beats Expectations at 0.6% in Q1",
    description: "Britain's economy grew faster than expected in the first quarter, boosted by strong services sector performance. The pound gained against major peers on the data release.",
    source: "Financial Times",
    publishedAt: "2026-04-06T09:45:00Z",
    url: "#",
    currencies: ["GBP"],
  },
  {
    id: "4",
    title: "Japan's CPI Rises 3.2%, Yen Strengthens on BoJ Speculation",
    description: "Consumer price inflation in Japan came in higher than expected, fueling speculation that the Bank of Japan may tighten monetary policy sooner than anticipated.",
    source: "Nikkei",
    publishedAt: "2026-04-06T06:00:00Z",
    url: "#",
    currencies: ["JPY"],
  },
  {
    id: "5",
    title: "Australian Employment Data Shows Robust Job Creation",
    description: "Australia added 38,000 jobs in March, well above the 25,000 forecast. The unemployment rate held steady at 3.7%, supporting the case for the RBA to maintain current rates.",
    source: "ABC News",
    publishedAt: "2026-04-05T23:30:00Z",
    url: "#",
    currencies: ["AUD"],
  },
  {
    id: "6",
    title: "US Non-Farm Payrolls Report Exceeds Forecasts with 275K Jobs Added",
    description: "The NFP report showed the US economy added 275,000 jobs in March, significantly beating the 200,000 consensus. Average hourly earnings rose 0.3% month-over-month.",
    source: "CNBC",
    publishedAt: "2026-04-05T18:00:00Z",
    url: "#",
    currencies: ["USD"],
  },
  {
    id: "7",
    title: "Bank of Canada Maintains Cautious Stance on Rate Adjustments",
    description: "The BoC kept its benchmark rate unchanged, noting that while inflation is trending lower, geopolitical risks and housing market pressures warrant a careful approach.",
    source: "Globe and Mail",
    publishedAt: "2026-04-05T15:00:00Z",
    url: "#",
    currencies: ["CAD"],
  },
  {
    id: "8",
    title: "EUR/GBP Drops as UK Retail Sales Surge 1.2% in March",
    description: "Stronger-than-expected retail sales data from the UK pushed EUR/GBP lower. Analysts note consumer spending resilience despite elevated borrowing costs.",
    source: "Reuters",
    publishedAt: "2026-04-05T11:30:00Z",
    url: "#",
    currencies: ["EUR", "GBP"],
  },
  {
    id: "9",
    title: "Gold Prices Surge as Geopolitical Tensions Boost Safe-Haven Demand",
    description: "Gold climbed above $2,350 per ounce amid escalating geopolitical tensions in the Middle East. The move coincided with broad USD strength as traders sought safety.",
    source: "MarketWatch",
    publishedAt: "2026-04-05T08:00:00Z",
    url: "#",
    currencies: ["USD"],
  },
  {
    id: "10",
    title: "AUD/USD Rallies on Strong Chinese Trade Data",
    description: "Better-than-expected Chinese export figures lifted the Australian dollar, as commodity-linked currencies benefited from improved global trade sentiment.",
    source: "Bloomberg",
    publishedAt: "2026-04-04T22:00:00Z",
    url: "#",
    currencies: ["AUD", "USD"],
  },
  {
    id: "11",
    title: "FOMC Minutes Reveal Division on Future Rate Path",
    description: "Minutes from the latest FOMC meeting showed a split among committee members on the timing and pace of rate cuts, adding uncertainty to the US dollar outlook.",
    source: "Wall Street Journal",
    publishedAt: "2026-04-04T19:00:00Z",
    url: "#",
    currencies: ["USD"],
  },
  {
    id: "12",
    title: "Canadian Dollar Weakens as Oil Prices Decline Sharply",
    description: "A 4% drop in crude oil prices weighed heavily on the Canadian dollar. USD/CAD pushed above 1.3650 as energy sector headwinds mounted.",
    source: "Reuters",
    publishedAt: "2026-04-04T14:00:00Z",
    url: "#",
    currencies: ["CAD", "USD"],
  },
];
