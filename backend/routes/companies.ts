import { Elysia, t } from "elysia";
import type { SecSubmissions } from "../services/filingHelper";
import { fetchWithUserAgent, SECRequestError } from "../services/fetchHelper";
import { formatFilings } from "../services/filingHelper";
import { CIKNotFoundError, tickerHelper } from "../services/tickerHelper";

/** Routes for retrieving filtered and paginated filings by company ticker. */
export const companiesRoutes = new Elysia({ prefix: "companies" });

const PAGE_SIZE = 25;

companiesRoutes.get(
	"/:ticker/filings",
	async ({ params, query, status }) => {
		try {
			const { ticker } = params;
			const cik = tickerHelper.getCIK(ticker);
			const page = query.page ?? 1;
			const sortOrder = query.sortOrder ?? "desc";
			const formTypeFilter: string[] = query.formTypeFilter ?? [];
			const { from, to } = query;

			const result = await fetchWithUserAgent(`https://data.sec.gov/submissions/CIK${cik}.json`);

			if (!result.ok) {
				throw new SECRequestError(`Failed to fetch filings for ticker: ${ticker}`);
			}

			const submissions = (await result.json()) as SecSubmissions;
			const filings = formatFilings(submissions.filings.recent, cik);
			const filteredFilings = filings.filter(
				(filing) => (formTypeFilter.length === 0 || formTypeFilter.includes(filing.form)) && (!from || filing.filingDate >= from) && (!to || filing.filingDate <= to),
			);
			filteredFilings.sort((left, right) => {
				const comparison = left.filingDate.localeCompare(right.filingDate);
				return sortOrder === "asc" ? comparison : -comparison;
			});
			const paginatedFilings = filteredFilings.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

			return {
				filings: paginatedFilings,
				pagination: { page, pageSize: PAGE_SIZE, total: filteredFilings.length },
			};
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
			page: t.Optional(t.Numeric({ minimum: 1 })),
			sortOrder: t.Optional(t.Union([t.Literal("asc"), t.Literal("desc")])),
			formTypeFilter: t.Optional(t.ArrayQuery(t.String())),
			from: t.Optional(t.String({ format: "date" })),
			to: t.Optional(t.String({ format: "date" })),
		}),
	},
);

companiesRoutes.get("/:ticker/forms", async ({ params, status }) => {
	try {
		const { ticker } = params;
		const cik = tickerHelper.getCIK(ticker);
		const response = await fetchWithUserAgent(`https://data.sec.gov/submissions/CIK${cik}.json`);

		if (!response.ok) {
			throw new SECRequestError(`Failed to fetch filing forms for ticker: ${ticker}`);
		}

		const submissions = (await response.json()) as SecSubmissions;
		const forms = [...new Set(submissions.filings.recent.form.map((form) => form.trim()).filter(Boolean))];

		return { forms };
	} catch (error) {
		if (error instanceof CIKNotFoundError) {
			return status(404, { error: error.message });
		}
		if (error instanceof SECRequestError) {
			return status(502, { error: error.message });
		}
		return status(500, { error: "An unexpected error occurred." });
	}
});
