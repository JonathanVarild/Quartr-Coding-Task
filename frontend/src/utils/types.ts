import type { SortOrder } from "../../../shared/types";

export type FilingFilters = {
	forms: string[];
	from: string;
	to: string;
	sortOrder: SortOrder;
};
