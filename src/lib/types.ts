export type StockType = "LT" | "ST" | "Gold ETF" | string;

export interface PortfolioRow {
  sl: number;
  name: string;
  type: StockType;
  qty: number;
  investPrice: number;
  investAmount: number;
  ticker: string;
  todaysPrice: number | null;
  todaysValue: number | null;
  gainLoss: number | null;
  gainLossPct: number | null;
  stockQuality?: string;
  reason?: string;
  actionSuggested?: string;
  notes: string;
  priceStatus: "idle" | "loading" | "ok" | "error";
}

export interface SummaryRow {
  type: string;
  allocationLakhs: number;
  allocationPct: number;
  actual: number | null;
  todaysValue: number | null;
  pnl: number | null;
  comments: string;
}

export interface PortfolioState {
  rows: PortfolioRow[];
  lastRefreshed: Date | null;
}
