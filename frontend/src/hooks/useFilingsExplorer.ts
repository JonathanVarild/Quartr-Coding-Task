import { useEffect, useState } from "react";
import type { CompanyFilingSummary, CompanyFilingsResponse } from "../../../shared/types";
import { fetchCompanyFilings, fetchFilingFilterOptions, fetchFilingSummary } from "../utils/api";
import type { FilingFilters } from "../utils/types";

const initialFilters: FilingFilters = {
	forms: [],
	from: "",
	to: "",
	sortOrder: "desc",
};

/**
 * Owns the filing explorer's search, filter, pagination, and request state.
 *
 * Requests are cancelled when their ticker, filters, or page become stale.
 * Summary failures are intentionally hidden so invalid tickers only surface the
 * more useful filings error.
 *
 * @returns Current explorer state together with search, filter, and pagination actions.
 */
export function useFilingsExplorer() {
	const [activeTicker, setActiveTicker] = useState("");
	const [summary, setSummary] = useState<CompanyFilingSummary | null>(null);
	const [availableForms, setAvailableForms] = useState<string[]>([]);
	const [response, setResponse] = useState<CompanyFilingsResponse | null>(null);
	const [filters, setFilters] = useState(initialFilters);
	const [page, setPage] = useState(1);
	const [searchVersion, setSearchVersion] = useState(0);
	const [isLoadingForms, setIsLoadingForms] = useState(false);
	const [isLoadingFilings, setIsLoadingFilings] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		if (!activeTicker) return;

		const controller = new AbortController();
		setIsLoadingForms(true);

		fetchFilingSummary(activeTicker, controller.signal)
			.then(setSummary)
			.catch(() => {
				if (!controller.signal.aborted) setSummary(null);
			});

		fetchFilingFilterOptions(activeTicker, controller.signal)
			.then(setAvailableForms)
			.catch(() => {
				if (!controller.signal.aborted) setAvailableForms([]);
			})
			.finally(() => {
				if (!controller.signal.aborted) setIsLoadingForms(false);
			});

		return () => controller.abort();
	}, [activeTicker, searchVersion]);

	useEffect(() => {
		if (!activeTicker) return;

		const controller = new AbortController();
		setIsLoadingFilings(true);
		setError("");

		fetchCompanyFilings({ ticker: activeTicker, page, ...filters }, controller.signal)
			.then(setResponse)
			.catch((requestError: unknown) => {
				if (requestError instanceof Error && requestError.name !== "AbortError") setError(requestError.message);
			})
			.finally(() => {
				if (!controller.signal.aborted) setIsLoadingFilings(false);
			});

		return () => controller.abort();
	}, [activeTicker, filters, page, searchVersion]);

	function search(ticker: string) {
		setActiveTicker(ticker.trim().toUpperCase());
		setFilters((current) => ({ ...current, forms: [] }));
		setSummary(null);
		setAvailableForms([]);
		setResponse(null);
		setPage(1);
		setSearchVersion((version) => version + 1);
	}

	function updateFilters(nextFilters: FilingFilters) {
		setFilters(nextFilters);
		setPage(1);
	}

	return {
		activeTicker,
		summary,
		availableForms,
		response,
		filters,
		isLoadingForms,
		isLoadingFilings,
		error,
		search,
		updateFilters,
		setPage,
	};
}
