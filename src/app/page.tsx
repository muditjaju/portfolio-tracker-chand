"use client";

import { useState } from "react";
import { RefreshCw, Download, LineChart } from "lucide-react";
import clsx from "clsx";
import { PortfolioRow } from "@/lib/types";
import { downloadPortfolioXlsx } from "@/lib/buildXlsx";
import UploadZone from "@/components/UploadZone";
import PortfolioTable from "@/components/PortfolioTable";
import SummaryPanel from "@/components/SummaryPanel";

export default function Home() {
  const [rows, setRows] = useState<PortfolioRow[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const hasData = rows.length > 0;

  const fetchPrices = async (currentRows: PortfolioRow[]) => {
    setIsRefreshing(true);
    // Set all to loading initially
    setRows((r) => r.map((row) => ({ ...row, priceStatus: "loading" })));

    const tickers = currentRows.map((r) => r.ticker);

    try {
      const res = await fetch("/api/prices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tickers }),
      });

      if (!res.ok) {
        throw new Error("Failed to fetch prices");
      }

      const { prices } = await res.json();

      setRows((prev) =>
        prev.map((row) => {
          const price = prices[row.ticker] ?? null;
          if (price === null) return { ...row, priceStatus: "error", todaysPrice: null, todaysValue: null, gainLoss: null, gainLossPct: null };
          
          const todaysValue = row.qty * price;
          const gainLoss = todaysValue - row.investAmount;
          return {
            ...row,
            todaysPrice: price,
            todaysValue,
            gainLoss,
            gainLossPct: row.investAmount ? gainLoss / row.investAmount : 0,
            priceStatus: "ok",
          };
        })
      );
      setLastRefreshed(new Date());
    } catch (error) {
      console.error(error);
      // Mark all currently loading as error if global fail
      setRows((prev) =>
        prev.map((row) =>
          row.priceStatus === "loading"
            ? { ...row, priceStatus: "error" }
            : row
        )
      );
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDataLoaded = (parsedRows: PortfolioRow[]) => {
    setRows(parsedRows);
    fetchPrices(parsedRows);
  };

  const handleRefresh = () => {
    if (!hasData) return;
    fetchPrices(rows);
  };

  const handleDownload = () => {
    if (!hasData) return;
    downloadPortfolioXlsx(rows);
  };

  const updateNote = (sl: number, note: string) => {
    setRows((prev) =>
      prev.map((r) => (r.sl === sl ? { ...r, notes: note } : r))
    );
  };

  const updatePrice = (sl: number, newPrice: number | null) => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.sl !== sl) return row;
        
        if (newPrice === null) {
          return { ...row, todaysPrice: null, todaysValue: null, gainLoss: null, gainLossPct: null, priceStatus: "ok" };
        }

        const todaysValue = row.qty * newPrice;
        const gainLoss = todaysValue - row.investAmount;
        return {
          ...row,
          todaysPrice: newPrice,
          todaysValue,
          gainLoss,
          gainLossPct: row.investAmount ? gainLoss / row.investAmount : 0,
          priceStatus: "ok",
        };
      })
    );
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      {/* Background aesthetics */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-400/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-400/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="glass sticky top-0 z-10 px-6 py-4 flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-600/20">
            <LineChart className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
              PMS Portfolio Tracker
            </h1>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleRefresh}
            disabled={!hasData || isRefreshing}
            className={clsx(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200",
              hasData && !isRefreshing
                ? "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm border border-slate-200 dark:border-slate-700 active:scale-95"
                : "bg-slate-100 dark:bg-slate-800/50 text-slate-400 dark:text-slate-600 cursor-not-allowed border border-transparent"
            )}
          >
            <RefreshCw className={clsx("w-4 h-4", isRefreshing && "animate-spin")} />
            Refresh Prices
          </button>
          <button
            onClick={handleDownload}
            disabled={!hasData}
            className={clsx(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200",
              hasData
                ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-600/20 active:scale-95"
                : "bg-slate-100 dark:bg-slate-800/50 text-slate-400 dark:text-slate-600 cursor-not-allowed"
            )}
          >
            <Download className="w-4 h-4" />
            Download XLSX
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 relative z-0 flex">
        {!hasData ? (
          <UploadZone onDataLoaded={handleDataLoaded} />
        ) : (
          <div className="flex gap-6 w-full max-w-[1600px] mx-auto items-start">
            <div className="flex-1 overflow-hidden">
              <PortfolioTable rows={rows} onUpdateNote={updateNote} onUpdatePrice={updatePrice} />
            </div>
            <div className="w-80 shrink-0 sticky top-24">
              <SummaryPanel rows={rows} lastRefreshed={lastRefreshed} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
