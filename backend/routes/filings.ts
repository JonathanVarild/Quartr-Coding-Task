import { Elysia, t } from "elysia";
import type { CompanyFilingSummary } from "../../shared/types";
import type { SecSubmissions } from "../services/filingHelper";
import { fetchWithUserAgent, SECRequestError } from "../services/fetchHelper";
import { countFilingsByForm } from "../services/filingHelper";
import { CIKNotFoundError, tickerHelper } from "../services/tickerHelper";

/** Routes for aggregate filing summaries across one or more tickers. */
export const filingsRoutes = new Elysia({ prefix: "filings" });

filingsRoutes.get(
	"/summary",
	async ({ query, status }) => {
		try {
			const tickers = [...new Set(query.tickers.map((ticker) => ticker.trim().toUpperCase()))];
			const summaries = await Promise.all(
				tickers.map(async (ticker): Promise<CompanyFilingSummary> => {
					const cik = tickerHelper.getCIK(ticker);
					const response = await fetchWithUserAgent(`https://data.sec.gov/submissions/CIK${cik}.json`);

					if (!response.ok) {
						throw new SECRequestError(`Failed to fetch filings for ticker: ${ticker}`);
					}

					const submissions = (await response.json()) as SecSubmissions;

					const today = new Date();
					const twelveMonthsAgo = new Date(today);
					twelveMonthsAgo.setUTCFullYear(twelveMonthsAgo.getUTCFullYear() - 1);
					const startDate = twelveMonthsAgo.toISOString().slice(0, 10);
					const endDate = today.toISOString().slice(0, 10);
					const formsFromLastTwelveMonths = submissions.filings.recent.form.filter((_, index) => {
						const filingDate = submissions.filings.recent.filingDate[index];
						return filingDate >= startDate && filingDate <= endDate;
					});

					const latest10KDate = submissions.filings.recent.filingDate.filter((_, index) => submissions.filings.recent.form[index] === "10-K")[0] ?? null;

					return {
						ticker,
						cik,
						latest10KDate,
						formCounts: countFilingsByForm(formsFromLastTwelveMonths),
					};
				}),
			);

			return { summaries };
		} catch (error) {
			if (error instanceof CIKNotFoundError) {
				return status(404, { error: error.message });
			}
			if (error instanceof SECRequestError) {
				return status(502, { error: error.message });
			}
			return status(500, { error: "An unexpected error occurred." });
		}
	},
	{
		query: t.Object({
			tickers: t.ArrayQuery(t.String({ minLength: 1 }), { minItems: 1 }),
		}),
	},
);
