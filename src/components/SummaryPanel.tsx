import { PortfolioRow } from "@/lib/types";
import { fmt, fmtLakh } from "@/lib/format";
import clsx from "clsx";

interface SummaryPanelProps {
  rows: PortfolioRow[];
  lastRefreshed: Date | null;
}

export default function SummaryPanel({ rows, lastRefreshed }: SummaryPanelProps) {
  const calcTotals = (subset: PortfolioRow[]) => {
    let invest = 0;
    let today = 0;
    subset.forEach((r) => {
      invest += r.investAmount;
      if (r.todaysValue) today += r.todaysValue;
    });
    return { invest, today, pnl: today - invest };
  };

  const ltRows = rows.filter((r) => r.type === "LT");
  const stRows = rows.filter((r) => r.type === "ST");
  const goldRows = rows.filter((r) => r.type === "Gold ETF");

  const ltT = calcTotals(ltRows);
  const stT = calcTotals(stRows);
  const goldT = calcTotals(goldRows);

  const totalInvest = ltT.invest + stT.invest + goldT.invest;
  const totalToday = ltT.today + stT.today + goldT.today;
  const overallPnl = totalToday - totalInvest;
  const overallPnlPct = totalInvest ? overallPnl / totalInvest : 0;

  const isGain = overallPnl >= 0;
  const isLoss = overallPnl < 0;

  const summaryData = [
    { type: "Long Term", ...ltT },
    { type: "Short Term", ...stT },
    { type: "Gold ETF", ...goldT },
  ];

  return (
    <div className="glass rounded-3xl p-6 shadow-sm sticky top-6">
      <h3 className="text-lg font-bold mb-6 flex items-center justify-between">
        Summary
        {lastRefreshed && (
          <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
            Updated: {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </h3>

      <div className="space-y-4 mb-8">
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Total Invested</p>
          <p className="text-2xl font-bold">{fmtLakh(totalInvest)}</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Current Value</p>
          <p className="text-2xl font-bold">{fmtLakh(totalToday)}</p>
        </div>

        <div
          className={clsx(
            "p-4 rounded-2xl border",
            isGain
              ? "bg-emerald-50/50 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800/30"
              : "bg-rose-50/50 border-rose-100 dark:bg-rose-900/20 dark:border-rose-800/30"
          )}
        >
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Overall P&L</p>
          <div className="flex items-baseline gap-2">
            <p
              className={clsx(
                "text-2xl font-bold",
                isGain && "text-emerald-600 dark:text-emerald-400",
                isLoss && "text-rose-500 dark:text-rose-400"
              )}
            >
              {overallPnl > 0 ? "+" : ""}
              {fmtLakh(overallPnl)}
            </p>
            <span
              className={clsx(
                "text-sm font-semibold",
                isGain && "text-emerald-600/80 dark:text-emerald-400/80",
                isLoss && "text-rose-500/80 dark:text-rose-400/80"
              )}
            >
              ({overallPnl > 0 ? "+" : ""}{(overallPnlPct * 100).toFixed(2)}%)
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-3">Breakdown</h4>
        {summaryData.map((row) => (
          <div key={row.type} className="flex justify-between items-center text-sm border-b border-slate-100 dark:border-slate-800 pb-2 last:border-0 last:pb-0">
            <span className="font-medium text-slate-700 dark:text-slate-300">{row.type}</span>
            <div className="text-right">
              <p className="font-medium">₹{fmt(row.invest ? row.today : 0, 0)}</p>
              {row.invest > 0 && (
                <p
                  className={clsx(
                    "text-xs font-medium",
                    row.pnl >= 0 ? "text-emerald-500" : "text-rose-500"
                  )}
                >
                  {row.pnl > 0 ? "+" : ""}
                  {(row.invest ? (row.pnl / row.invest) * 100 : 0).toFixed(2)}%
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
