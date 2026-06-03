import YahooFinance from "yahoo-finance2";
import { NextResponse } from "next/server";
import { EquityDetails, NseIndia } from "stock-nse-india";

const yahooFinance = new YahooFinance();
const nseIndia = new NseIndia();

// Set to "YAHOO" to use Yahoo Finance, "NSE" to use NSE directly
const PRICE_SOURCE: "YAHOO" | "NSE" = "YAHOO";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tickers } = body;

    if (!tickers || !Array.isArray(tickers)) {
      return NextResponse.json(
        { error: "Invalid tickers format" },
        { status: 400 },
      );
    }

    const results: Record<string, number | null> = {};

    await Promise.allSettled(
      tickers.map(async (ticker: string) => {
        try {
          if (PRICE_SOURCE === "NSE") {
            const nseSymbol = ticker.replace(/\.NS$/, "");

            const quote: EquityDetails =
              await nseIndia.getEquityDetails(nseSymbol);

            if (ticker === "AAVAS.NS") console.log(quote);

            // Try different paths where the price might be
            const price = quote?.priceInfo?.lastPrice;

            results[ticker] = price;
          } else {
            const quote = await yahooFinance.quote(ticker);
            // if (ticker === "AAVAS.NS") console.log(quote);

            results[ticker] = quote.regularMarketPrice ?? null;
          }
        } catch (err) {
          results[ticker] = null;
        }
      }),
    );

    return NextResponse.json({ prices: results });
  } catch (error) {
    console.error("Error fetching prices:", error);
    return NextResponse.json(
      { error: "Failed to fetch prices" },
      { status: 500 },
    );
  }
}
