import * as xlsx from "xlsx";
import { PortfolioRow } from "./types";

export function downloadPortfolioXlsx(rows: PortfolioRow[]): void {
  // We need to create a new workbook with the updated data
  const wb = xlsx.utils.book_new();

  // Create Header
  const header = [
    "Sl",
    "Particulars",
    "Type",
    "Quantity",
    "Invest Price",
    "Invest Amount",
    "Today's Price",
    "Today's Value",
    "Loss/ Gain",
    "Loss / Gain %",
    "Stock Quality",
    "Reason",
    "Action Suggested",
    "Notes",
  ];

  // Map our state rows back to Excel arrays
  const dataRows = rows.map((r) => [
    r.sl,
    r.name,
    r.type,
    r.qty,
    r.investPrice,
    r.investAmount,
    r.todaysPrice ?? "",
    r.todaysValue ?? "",
    r.gainLoss ?? "",
    r.gainLossPct != null ? `${(r.gainLossPct * 100).toFixed(0)}%` : "",
    r.stockQuality || "",
    r.reason || "",
    r.actionSuggested || "",
    r.notes || "",
  ]);

  // Optional: Add Summary Sheet based on rows
  const ltRows = rows.filter((r) => r.type === "LT");
  const stRows = rows.filter((r) => r.type === "ST");
  const goldRows = rows.filter((r) => r.type === "Gold ETF");

  const calcTotals = (subset: PortfolioRow[]) => {
    let invest = 0;
    let today = 0;
    subset.forEach((r) => {
      invest += r.investAmount;
      if (r.todaysValue) today += r.todaysValue;
    });
    return { invest, today, pnl: today - invest };
  };

  const ltT = calcTotals(ltRows);
  const stT = calcTotals(stRows);
  const goldT = calcTotals(goldRows);

  const totalInvest = ltT.invest + stT.invest + goldT.invest;
  const totalToday = ltT.today + stT.today + goldT.today;

  const totalRow = [
    "",
    "",
    "",
    "",
    "",
    totalInvest,
    "",
    totalToday,
    totalToday - totalInvest,
    totalInvest
      ? `${(((totalToday - totalInvest) / totalInvest) * 100).toFixed(0)}%`
      : "0%",
  ];

  const emptyRow: any[] = [];

  const stRow = ["", "", "", "", "ST", stT.invest, "", stT.today];
  const ltRow = ["", "", "", "", "LT", ltT.invest, "", ltT.today];
  const goldRow = ["", "", "", "", "Gold ETF", goldT.invest, "", goldT.today];
  const summaryTotalRow = ["", "", "", "", "", totalInvest, "", totalToday];

  const combinedData = [
    header,
    ...dataRows,
    emptyRow,
    emptyRow,
    emptyRow,
    totalRow,
    emptyRow,
    emptyRow,
    stRow,
    ltRow,
    goldRow,
    summaryTotalRow,
  ];

  const ws = xlsx.utils.aoa_to_sheet(combinedData);

  // Append sheet
  xlsx.utils.book_append_sheet(wb, ws, "Portfolio");

  // Trigger download
  xlsx.writeFile(wb, "portfolio_updated.xlsx");
}
