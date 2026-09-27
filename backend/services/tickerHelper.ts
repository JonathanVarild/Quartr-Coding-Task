import { fetchWithUserAgent } from "./fetchHelper";

type CompanyTicker = {
	cik_str: number;
	ticker: string;
};

class TickerHelper {
	private tickerToCIKMap = new Map<string, string>();
	private initialized = false;

	/**
	 * Loads the SEC ticker-to-CIK mapping once for the application process.
	 *
	 * @returns A promise that resolves when ticker lookup is ready.
	 * @throws An {@link Error} when the SEC responds unsuccessfully.
	 * @throws An {@link Error} when the network request cannot be completed.
	 */
	async initialize(): Promise<void> {
		if (this.initialized) return;

		console.log("Fetching SEC company tickers...");

		const response = await fetchWithUserAgent("https://www.sec.gov/files/company_tickers.json");

		if (!response.ok) {
			throw new Error(`Failed to fetch SEC company tickers: ${response.status} ${response.statusText}`);
		}

		const data = (await response.json()) as Record<string, CompanyTicker>;
		for (const company of Object.values(data)) {
			this.tickerToCIKMap.set(company.ticker, String(company.cik_str).padStart(10, "0"));
		}

		console.log("SEC company tickers fetched and mapped successfully.");

		this.initialized = true;
	}

	/**
	 * Resolves a company ticker to its ten-character, zero-padded CIK.
	 *
	 * @param ticker - Company ticker; matching is case-insensitive.
	 * @returns The corresponding SEC CIK.
	 * @throws An {@link Error} when the helper has not been initialized.
	 * @throws A {@link CIKNotFoundError} when the ticker is unknown.
	 */
	getCIK(ticker: string): string {
		if (!this.initialized) throw new Error("TickerHelper is not initialized. Call initialize() first.");

		const cik = this.tickerToCIKMap.get(ticker.toUpperCase());
		if (!cik) throw new CIKNotFoundError(ticker);

		return cik;
	}
}

/** Error raised when no SEC CIK exists for a requested ticker. */
export class CIKNotFoundError extends Error {
	/**
	 * @param ticker - Ticker that could not be resolved.
	 */
	constructor(ticker: string) {
		super(`CIK not found for ticker: ${ticker}`);
		this.name = "CIKNotFoundError";
	}
}

/** Shared ticker lookup initialized during application startup. */
export const tickerHelper = new TickerHelper();
