import { PortfolioRow } from "@/lib/types";
import { fmt } from "@/lib/format";
import { Loader2 } from "lucide-react";
import clsx from "clsx";

interface PortfolioTableProps {
  rows: PortfolioRow[];
  onUpdateNote: (sl: number, note: string) => void;
  onUpdatePrice: (sl: number, price: number | null) => void;
}

export default function PortfolioTable({ rows, onUpdateNote, onUpdatePrice }: PortfolioTableProps) {
  return (
    <div className="glass rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left whitespace-nowrap">
          <thead className="text-xs uppercase bg-slate-100/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400">
            <tr>
              <th className="px-4 py-4 font-medium tracking-wider w-[60px] min-w-[60px] max-w-[60px] sticky left-0 z-20 bg-slate-100 dark:bg-slate-800">#</th>
              <th className="px-4 py-4 font-medium tracking-wider sticky left-[60px] z-20 bg-slate-100 dark:bg-slate-800 shadow-[1px_0_0_0_theme(colors.slate.200)] dark:shadow-[1px_0_0_0_theme(colors.slate.700)]">Stock</th>
              <th className="px-4 py-4 font-medium tracking-wider">Type</th>
              <th className="px-4 py-4 font-medium tracking-wider text-right">Qty</th>
              <th className="px-4 py-4 font-medium tracking-wider text-right">Invest Price</th>
              <th className="px-4 py-4 font-medium tracking-wider text-right">Invest Amount</th>
              <th className="px-4 py-4 font-medium tracking-wider text-right">Today's Price</th>
              <th className="px-4 py-4 font-medium tracking-wider text-right">Today's Value</th>
              <th className="px-4 py-4 font-medium tracking-wider text-right">Gain / Loss</th>
              <th className="px-4 py-4 font-medium tracking-wider text-right">G/L %</th>
              <th className="px-4 py-4 font-medium tracking-wider w-48">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/50 dark:divide-slate-700/50">
            {rows.map((row) => {
              const isGain = row.gainLoss !== null && row.gainLoss >= 0;
              const isLoss = row.gainLoss !== null && row.gainLoss < 0;

              return (
                <tr
                  key={row.sl}
                  className="group hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                >
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400 w-[60px] min-w-[60px] max-w-[60px] sticky left-0 z-10 bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800 transition-colors">{row.sl}</td>
                  <td className="px-4 py-3 font-medium sticky left-[60px] z-10 bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800 transition-colors shadow-[1px_0_0_0_theme(colors.slate.100)] dark:shadow-[1px_0_0_0_theme(colors.slate.800)]">{row.name}</td>
                  <td className="px-4 py-3">
                    <span
                      className={clsx(
                        "px-2.5 py-1 text-xs font-semibold rounded-full",
                        row.type === "LT" && "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
                        row.type === "ST" && "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/40 dark:text-fuchsia-300",
                        row.type === "Gold ETF" && "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                      )}
                    >
                      {row.type || "Other"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">{row.qty}</td>
                  <td className="px-4 py-3 text-right">₹{fmt(row.investPrice)}</td>
                  <td className="px-4 py-3 text-right font-medium">₹{fmt(row.investAmount)}</td>
                  <td className="px-4 py-3 text-right">
                    {row.priceStatus === "loading" ? (
                      <div className="flex justify-end items-center h-8">
                        <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-1">
                        <span className="text-slate-500">₹</span>
                        <input
                          type="number"
                          className="w-20 text-right bg-transparent text-sm border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none transition-colors px-1 py-1 dark:hover:border-slate-600 [&::-webkit-inner-spin-button]:appearance-none"
                          value={row.todaysPrice ?? ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            onUpdatePrice(row.sl, val === "" ? null : parseFloat(val));
                          }}
                          placeholder="—"
                        />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {row.todaysValue !== null ? `₹${fmt(row.todaysValue)}` : "—"}
                  </td>
                  <td
                    className={clsx(
                      "px-4 py-3 text-right font-semibold",
                      isGain && "text-emerald-600 dark:text-emerald-400",
                      isLoss && "text-rose-500 dark:text-rose-400"
                    )}
                  >
                    {row.gainLoss !== null ? `${row.gainLoss > 0 ? "+" : ""}₹${fmt(row.gainLoss)}` : "—"}
                  </td>
                  <td
                    className={clsx(
                      "px-4 py-3 text-right font-semibold",
                      isGain && "text-emerald-600 dark:text-emerald-400",
                      isLoss && "text-rose-500 dark:text-rose-400"
                    )}
                  >
                    {row.gainLossPct !== null
                      ? `${row.gainLossPct > 0 ? "+" : ""}${(row.gainLossPct * 100).toFixed(2)}%`
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <input
                      className="w-full bg-transparent text-sm border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none transition-colors px-1 py-1 dark:hover:border-slate-600"
                      value={row.notes}
                      onChange={(e) => onUpdateNote(row.sl, e.target.value)}
                      placeholder="Add note..."
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
