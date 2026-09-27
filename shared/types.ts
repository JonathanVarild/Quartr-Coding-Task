export type FormCounts = Record<string, number>;
export type SortOrder = "asc" | "desc";

export type CompanyFilingSummary = {
	ticker: string;
	cik: string;
	latest10KDate: string | null;
	formCounts: FormCounts;
};

export type FilingSummaryResponse = {
	summaries: CompanyFilingSummary[];
};

export type FilingFilterOptionsResponse = {
	forms: string[];
};

export type Filing = {
	accessionNumber: string;
	filingDate: string;
	reportDate: string;
	acceptanceDateTime: string;
	act: string;
	form: string;
	fileNumber: string;
	filmNumber: string;
	items: string[];
	coreType: string;
	size: number;
	isXBRL: boolean;
	isInlineXBRL: boolean;
	isXBRLNumeric: boolean;
	primaryDocument: string;
	primaryDocDescription: string;
	primaryDocumentUrl: string;
};

export type Pagination = {
	page: number;
	pageSize: number;
	total: number;
};

export type CompanyFilingsResponse = {
	filings: Filing[];
	pagination: Pagination;
};

export type ApiError = {
	error: string;
};
