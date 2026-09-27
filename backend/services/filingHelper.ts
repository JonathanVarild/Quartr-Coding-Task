import type { Filing, FormCounts } from "../../shared/types";

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
	};
};

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
 * @param columns - Aligned filing columns from `filings.recent`.
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
