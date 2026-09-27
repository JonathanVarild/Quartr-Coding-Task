import type { ApiError, CompanyFilingSummary, CompanyFilingsResponse, FilingFilterOptionsResponse, FilingSummaryResponse, SortOrder } from "../../../shared/types";

type FilingQuery = {
	ticker: string;
	page: number;
	sortOrder: SortOrder;
	forms: string[];
	from: string;
	to: string;
};

/** Fetches and validates a JSON API response before returning its typed body. */
async function requestJson<T extends object>(url: string, signal?: AbortSignal): Promise<T> {
	const response = await fetch(url, { signal });
	const data = (await response.json()) as T | ApiError;

	if (!response.ok || "error" in data) {
		throw new Error("error" in data ? data.error : "The request failed.");
	}

	return data;
}

/**
 * Fetches the twelve-month filing summary for one company.
 *
 * @param ticker - Normalized company ticker used to select the returned summary.
 * @param signal - Optional signal used to cancel the request.
 * @returns The summary associated with the requested ticker.
 * @throws An {@link Error} when the API rejects the request or omits the ticker.
 * @throws An `AbortError` when the supplied signal aborts the request.
 */
export async function fetchFilingSummary(ticker: string, signal?: AbortSignal): Promise<CompanyFilingSummary> {
	const params = new URLSearchParams({ tickers: ticker });
	const response = await requestJson<FilingSummaryResponse>(`/filings/summary?${params}`, signal);
	const summary = response.summaries.find((item) => item.ticker === ticker);

	if (!summary) {
		throw new Error(`No filing summary was found for ${ticker}.`);
	}

	return summary;
}

/**
 * Fetches the form names available to the filing filter dropdown.
 *
 * @param ticker - Normalized company ticker whose forms should be returned.
 * @param signal - Optional signal used to cancel the request.
 * @returns Distinct form names across the company's available recent filings.
 * @throws An {@link Error} when the API returns an unsuccessful response.
 * @throws An `AbortError` when the supplied signal aborts the request.
 */
export async function fetchFilingFilterOptions(ticker: string, signal?: AbortSignal): Promise<string[]> {
	const response = await requestJson<FilingFilterOptionsResponse>(`/companies/${encodeURIComponent(ticker)}/forms`, signal);
	return response.forms;
}

/**
 * Fetches one filtered and sorted page of company filings.
 *
 * @param query - Ticker, page number, sort order, form filters, and optional date range.
 * @param signal - Optional signal used to cancel the request.
 * @returns The matching filings and their pagination metadata.
 * @throws An {@link Error} when the API returns an unsuccessful response.
 * @throws An `AbortError` when the supplied signal aborts the request.
 */
export function fetchCompanyFilings(query: FilingQuery, signal?: AbortSignal): Promise<CompanyFilingsResponse> {
	const { ticker, page, sortOrder, forms, from, to } = query;
	const params = new URLSearchParams({ page: String(page), sortOrder });

	for (const form of forms) {
		params.append("formTypeFilter", form);
	}

	if (from) params.set("from", from);
	if (to) params.set("to", to);

	return requestJson<CompanyFilingsResponse>(`/companies/${encodeURIComponent(ticker)}/filings?${params}`, signal);
}
