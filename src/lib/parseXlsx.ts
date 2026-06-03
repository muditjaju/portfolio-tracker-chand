import * as xlsx from "xlsx";
import { PortfolioRow } from "./types";

const TICKER_OVERRIDES: Record<string, string> = {
  "GOLDIETF-E": "GOLDBEES.NS",
  LT: "LT.NS",
};

export function parsePortfolioSheet(file: ArrayBuffer): PortfolioRow[] {
  const workbook = xlsx.read(file, { type: "array" });
  console.log("Workbook loaded. Sheet names:", workbook.SheetNames);
  
  let targetSheetName = "";
  let headerRowIndex = 1; // Default to row 2
  let targetRows: any[][] = [];

  // Try to find the sheet that actually contains the portfolio data
  for (const name of workbook.SheetNames) {
    const sheet = workbook.Sheets[name];
    const rows = xlsx.utils.sheet_to_json<any[]>(sheet, { header: 1 });
    
    const foundHeaderIndex = rows.findIndex(row => 
      row && row.some(cell => 
        typeof cell === 'string' && 
        (cell.toLowerCase().includes('particulars') || cell.toLowerCase().includes('quantity'))
      )
    );

    if (foundHeaderIndex !== -1) {
      console.log(`Found headers in sheet "${name}" at row index ${foundHeaderIndex}`);
      targetSheetName = name;
      headerRowIndex = foundHeaderIndex;
      targetRows = rows;
      break;
    }
  }

  if (!targetSheetName) {
    console.log("Could not find headers dynamically. Falling back to sheet name guessing.");
    targetSheetName = workbook.SheetNames.find(name => name.toLowerCase().trim().includes("portfolio")) 
      || (workbook.SheetNames.length > 1 ? workbook.SheetNames[1] : workbook.SheetNames[0]);
    targetRows = xlsx.utils.sheet_to_json<any[]>(workbook.Sheets[targetSheetName], { header: 1 });
    console.log(`Fell back to sheet "${targetSheetName}".`);
  }

  const portfolioRows: PortfolioRow[] = [];

  // Data starts one row after the header row
  const startIndex = headerRowIndex + 1;
  console.log(`Starting data parsing from row index ${startIndex}. Total rows in sheet: ${targetRows.length}`);

  for (let i = startIndex; i < targetRows.length; i++) {
    const row = targetRows[i];
    if (!row || row.length === 0) continue;

    // Col B is index 1, Particulars (name)
    const slRaw = row[0];
    const name = row[1];
    
    // Stop reading when column B is empty or it's a subtotal row
    if (!name || typeof name !== "string" || !name.trim()) {
      console.log(`Skipping row ${i} because 'name' is invalid:`, { sl: slRaw, name });
      continue;
    }
    
    // Skip subtotal rows
    if (name.toLowerCase().includes("total") || name.toLowerCase().includes("subtotal")) {
      console.log(`Skipping row ${i} because it's a subtotal row:`, name);
      continue;
    }

    // Skip the header row if it happens to be evaluated
    if (String(slRaw).toLowerCase().includes("sl") || name.toLowerCase() === "particulars") {
      console.log(`Skipping row ${i} because it appears to be a header row:`, { sl: slRaw, name });
      continue;
    }

    // If 'sl' is empty in the excel, just use the row index as the serial number
    const sl = slRaw || i;

    console.log(`Successfully parsed valid row ${i}:`, { sl, name });

    const type = row[2] || "";
    const qty = Number(row[3]) || 0;
    const investPrice = Number(row[4]) || 0;
    const investAmount = Number(row[5]) || qty * investPrice;
    
    const stockQuality = row[10] || "";
    const reason = row[11] || "";
    const actionSuggested = row[12] || "";
    const notes = row[13] || ""; // Assuming notes is at N (index 13) if present

    const ticker = TICKER_OVERRIDES[name] ?? `${name}.NS`;

    portfolioRows.push({
      sl,
      name,
      type,
      qty,
      investPrice,
      investAmount,
      ticker,
      todaysPrice: null,
      todaysValue: null,
      gainLoss: null,
      gainLossPct: null,
      stockQuality,
      reason,
      actionSuggested,
      notes,
      priceStatus: "idle",
    });
  }

  return portfolioRows;
}
