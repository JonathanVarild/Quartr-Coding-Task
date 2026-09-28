import type { Filing, FormCounts } from "../../shared/types";
import { fetchWithUserAgent, SECRequestError } from "./fetchHelper";

const CACHE_TTL_MS = 3600 * 1000;

export type SecFilingColumns = {
	accessionNumber: string[];
	filingDate: string[];
	reportDate: string[];
	acceptanceDateTime: string[];
	act: string[];
	form: string[];
	fileNumber: string[];
	filmNumber: string[];
	items: string[];
	core_type: string[];
	size: number[];
	isXBRL: number[];
	isInlineXBRL: number[];
	isXBRLNumeric: number[];
	primaryDocument: string[];
	primaryDocDescription: string[];
};

export type SecSubmissions = {
	filings: {
		recent: SecFilingColumns;
		files: Array<{ name: string }>;
	};
};

type FilingCacheEntry = {
	filings: SecFilingColumns;
	expiresAt: number;
};

const filingCache = new Map<string, FilingCacheEntry>();
const filingRequests = new Map<string, Promise<SecFilingColumns>>();

async function fetchCompanyFilings(cik: string): Promise<SecFilingColumns> {
	const response = await fetchWithUserAgent(`https://data.sec.gov/submissions/CIK${cik}.json`);

	if (!response.ok) {
		throw new SECRequestError(`Failed to fetch filings for CIK: ${cik}`);
	}

	const submissions = (await response.json()) as SecSubmissions;
	const filings = submissions.filings.recent;

	for (const file of submissions.filings.files) {
		const fileResponse = await fetchWithUserAgent(`https://data.sec.gov/submissions/${file.name}`);

		if (!fileResponse.ok) {
			throw new SECRequestError(`Failed to fetch filings for CIK: ${cik}`);
		}

		const historicalFilings = (await fileResponse.json()) as SecFilingColumns;
		for (const key of Object.keys(filings) as Array<keyof SecFilingColumns>) {
			(filings[key] as Array<string | number>).push(...historicalFilings[key]);
		}
	}

	return filings;
}

/**
 * Retrieves the complete raw SEC filing history for a company.
 *
 * The recent filings from the main submissions response are followed by every
 * referenced historical submissions file. Completed histories are cached by CIK
 * for one hour, and concurrent cache misses for the same CIK share one promise.
 *
 * @param cik - Zero-padded company CIK.
 * @returns The SEC's merged, unformatted parallel filing columns.
 * @throws A {@link SECRequestError} when any required SEC request fails.
 */
export function getCompanyFilings(cik: string): Promise<SecFilingColumns> {
	const cached = filingCache.get(cik);
	if (cached && cached.expiresAt > Date.now()) {
		return Promise.resolve(cached.filings);
	}

	const pendingRequest = filingRequests.get(cik);
	if (pendingRequest) {
		return pendingRequest;
	}

	const request = fetchCompanyFilings(cik)
		.then((filings) => {
			filingCache.set(cik, { filings, expiresAt: Date.now() + CACHE_TTL_MS });
			return filings;
		})
		.finally(() => filingRequests.delete(cik));

	filingRequests.set(cik, request);
	return request;
}

/**
 * Counts non-empty SEC form names after trimming surrounding whitespace.
 *
 * @param forms - Form values from the SEC submissions response.
 * @returns A map from normalized form name to occurrence count.
 */
export function countFilingsByForm(forms: string[]): FormCounts {
	return forms.reduce<FormCounts>((counts, form) => {
		const normalizedForm = form.trim();

		if (normalizedForm) {
			counts[normalizedForm] = (counts[normalizedForm] ?? 0) + 1;
		}

		return counts;
	}, {});
}

/**
 * Converts the SEC's parallel filing columns into application filing objects.
 *
 * @param columns - Aligned raw SEC filing columns.
 * @param cik - Zero-padded company CIK used to construct document URLs.
 * @returns One normalized filing for every accession number.
 * @throws A {@link TypeError} when required parallel-column data is missing.
 */
export function formatFilings(columns: SecFilingColumns, cik: string): Filing[] {
	const unpaddedCik = cik.replace(/^0+/, "");

	return columns.accessionNumber.map((accessionNumber, index) => ({
		accessionNumber,
		filingDate: columns.filingDate[index],
		reportDate: columns.reportDate[index],
		acceptanceDateTime: columns.acceptanceDateTime[index],
		act: columns.act[index],
		form: columns.form[index],
		fileNumber: columns.fileNumber[index],
		filmNumber: columns.filmNumber[index],
		items: columns.items[index]
			.split(",")
			.map((item) => item.trim())
			.filter(Boolean),
		coreType: columns.core_type[index],
		size: columns.size[index],
		isXBRL: Boolean(columns.isXBRL[index]),
		isInlineXBRL: Boolean(columns.isInlineXBRL[index]),
		isXBRLNumeric: Boolean(columns.isXBRLNumeric[index]),
		primaryDocument: columns.primaryDocument[index],
		primaryDocDescription: columns.primaryDocDescription[index],
		primaryDocumentUrl: `https://www.sec.gov/Archives/edgar/data/${unpaddedCik}/${accessionNumber.replaceAll("-", "")}/${columns.primaryDocument[index]}`,
	}));
}
