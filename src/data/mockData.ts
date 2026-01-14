export const recentTrades = [
  { id: 1, pair: "EUR/USD", type: "Buy", pips: 45, profit: 225, strategy: "Breakout", date: "2024-01-15" },
  { id: 2, pair: "GBP/USD", type: "Sell", pips: -22, profit: -110, strategy: "Trend Following", date: "2024-01-14" },
  { id: 3, pair: "USD/JPY", type: "Buy", pips: 67, profit: 335, strategy: "Support/Resistance", date: "2024-01-13" },
  { id: 4, pair: "AUD/USD", type: "Sell", pips: 38, profit: 190, strategy: "Breakout", date: "2024-01-12" },
  { id: 5, pair: "EUR/GBP", type: "Buy", pips: -15, profit: -75, strategy: "Scalping", date: "2024-01-11" },
  { id: 6, pair: "USD/CHF", type: "Sell", pips: 52, profit: 260, strategy: "Trend Following", date: "2024-01-10" },
  { id: 7, pair: "NZD/USD", type: "Buy", pips: 28, profit: 140, strategy: "Support/Resistance", date: "2024-01-09" },
  { id: 8, pair: "EUR/USD", type: "Sell", pips: -33, profit: -165, strategy: "Breakout", date: "2024-01-08" },
];

export const allTrades = [
  ...recentTrades,
  { id: 9, pair: "GBP/JPY", type: "Buy", pips: 89, profit: 445, strategy: "Trend Following", date: "2024-01-07" },
  { id: 10, pair: "EUR/JPY", type: "Sell", pips: -18, profit: -90, strategy: "Scalping", date: "2024-01-06" },
  { id: 11, pair: "AUD/JPY", type: "Buy", pips: 42, profit: 210, strategy: "Support/Resistance", date: "2024-01-05" },
  { id: 12, pair: "CAD/JPY", type: "Sell", pips: 31, profit: 155, strategy: "Breakout", date: "2024-01-04" },
  { id: 13, pair: "EUR/USD", type: "Buy", pips: -25, profit: -125, strategy: "Trend Following", date: "2024-01-03" },
  { id: 14, pair: "GBP/USD", type: "Sell", pips: 56, profit: 280, strategy: "Support/Resistance", date: "2024-01-02" },
  { id: 15, pair: "USD/CAD", type: "Buy", pips: 19, profit: 95, strategy: "Scalping", date: "2024-01-01" },
];

export const equityCurveData = [
  { date: "Week 1", equity: 10000 },
  { date: "Week 2", equity: 10450 },
  { date: "Week 3", equity: 10280 },
  { date: "Week 4", equity: 10890 },
  { date: "Week 5", equity: 11250 },
  { date: "Week 6", equity: 10980 },
  { date: "Week 7", equity: 11520 },
  { date: "Week 8", equity: 11890 },
  { date: "Week 9", equity: 12150 },
  { date: "Week 10", equity: 11920 },
  { date: "Week 11", equity: 12480 },
  { date: "Week 12", equity: 12850 },
];

export const winLossData = [
  { name: "Wins", value: 68, fill: "hsl(var(--primary))" },
  { name: "Losses", value: 32, fill: "hsl(var(--destructive))" },
];

export const pairPerformanceData = [
  { pair: "EUR/USD", trades: 45, winRate: 62, profit: 1250 },
  { pair: "GBP/USD", trades: 38, winRate: 58, profit: 890 },
  { pair: "USD/JPY", trades: 32, winRate: 71, profit: 1520 },
  { pair: "AUD/USD", trades: 28, winRate: 54, profit: 420 },
  { pair: "EUR/GBP", trades: 22, winRate: 68, profit: 780 },
  { pair: "USD/CHF", trades: 18, winRate: 61, profit: 550 },
  { pair: "NZD/USD", trades: 15, winRate: 47, profit: -120 },
  { pair: "GBP/JPY", trades: 12, winRate: 75, profit: 920 },
];

export const monthlyPerformanceData = [
  { month: "Jan", profit: 1250, trades: 28 },
  { month: "Feb", profit: -320, trades: 24 },
  { month: "Mar", profit: 890, trades: 31 },
  { month: "Apr", profit: 1520, trades: 35 },
  { month: "May", profit: 680, trades: 27 },
  { month: "Jun", profit: -150, trades: 22 },
  { month: "Jul", profit: 1100, trades: 29 },
  { month: "Aug", profit: 750, trades: 26 },
  { month: "Sep", profit: 1380, trades: 33 },
  { month: "Oct", profit: -280, trades: 21 },
  { month: "Nov", profit: 920, trades: 30 },
  { month: "Dec", profit: 1450, trades: 34 },
];

export const winRateTrendData = [
  { month: "Jan", winRate: 58 },
  { month: "Feb", winRate: 52 },
  { month: "Mar", winRate: 61 },
  { month: "Apr", winRate: 67 },
  { month: "May", winRate: 63 },
  { month: "Jun", winRate: 55 },
  { month: "Jul", winRate: 69 },
  { month: "Aug", winRate: 64 },
  { month: "Sep", winRate: 71 },
  { month: "Oct", winRate: 58 },
  { month: "Nov", winRate: 66 },
  { month: "Dec", winRate: 72 },
];

export const strategies = [
  { id: 1, name: "Breakout", trades: 48, winRate: 65, profit: 2450 },
  { id: 2, name: "Trend Following", trades: 62, winRate: 58, profit: 1890 },
  { id: 3, name: "Support/Resistance", trades: 55, winRate: 71, profit: 3120 },
  { id: 4, name: "Scalping", trades: 89, winRate: 52, profit: 780 },
  { id: 5, name: "Fibonacci Retracement", trades: 34, winRate: 68, profit: 1650 },
];

export const forexPairs = [
  "EUR/USD", "GBP/USD", "USD/JPY", "AUD/USD", "EUR/GBP",
  "USD/CHF", "NZD/USD", "GBP/JPY", "EUR/JPY", "AUD/JPY",
  "USD/CAD", "CAD/JPY", "EUR/AUD", "GBP/AUD", "CHF/JPY"
];

export const strategyOptions = [
  "Breakout", "Trend Following", "Support/Resistance", "Scalping",
  "Fibonacci Retracement", "Moving Average Crossover", "Price Action"
];

export const riskRules = [
  { id: 1, rule: "Maximum risk per trade", value: "2%", status: "active" },
  { id: 2, rule: "Maximum daily loss", value: "5%", status: "active" },
  { id: 3, rule: "Maximum weekly loss", value: "10%", status: "active" },
  { id: 4, rule: "Maximum open positions", value: "3", status: "active" },
  { id: 5, rule: "Minimum risk/reward ratio", value: "1:2", status: "active" },
];
