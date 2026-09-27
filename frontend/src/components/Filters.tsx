import { useState, type FormEvent } from "react";
import type { SortOrder } from "../../../shared/types";
import type { FilingFilters } from "../utils/types";
import { FormTypeFilter } from "./FormTypeFilter";

type FiltersProps = {
	activeTicker: string;
	availableForms: string[];
	filters: FilingFilters;
	isLoadingForms: boolean;
	onSearch: (ticker: string) => void;
	onChange: (filters: FilingFilters) => void;
};

type DateFilterProps = {
	id: string;
	label: string;
	value: string;
	min?: string;
	max?: string;
	onChange: (date: string) => void;
};

const fieldLabelClass = "block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500";
const fieldClass =
	"h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100";
const clearButtonClass = "text-xs font-semibold text-blue-600 transition hover:text-blue-800 disabled:cursor-not-allowed disabled:text-slate-300";

function DateFilter({ id, label, value, min, max, onChange }: DateFilterProps) {
	return (
		<div>
			<div className="mb-2 flex items-center justify-between gap-2">
				<label htmlFor={id} className={fieldLabelClass}>
					{label}
				</label>
				<button type="button" onClick={() => onChange("")} disabled={!value} className={clearButtonClass}>
					Clear
				</button>
			</div>
			<input type="date" id={id} value={value} min={min} max={max} onChange={(event) => onChange(event.target.value)} className={fieldClass} />
		</div>
	);
}

/**
 * Renders the ticker search and all filing filter controls.
 *
 * @param activeTicker - Ticker currently used by the results request.
 * @param availableForms - Filing form names available for the active ticker.
 * @param filters - Current form, date, and sort selections.
 * @param isLoadingForms - Whether available form names are being loaded.
 * @param onSearch - Called with the ticker entered by the user.
 * @param onChange - Called with the complete next filter state.
 * @returns The filing search form.
 */
export function Filters({ activeTicker, availableForms, filters, isLoadingForms, onSearch, onChange }: FiltersProps) {
	const [ticker, setTicker] = useState("");

	function updateFilters(update: Partial<FilingFilters>) {
		onChange({ ...filters, ...update });
	}

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		onSearch(ticker);
	}

	return (
		<form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
			<div className="grid gap-4 xl:grid-cols-[minmax(220px,1.3fr)_minmax(190px,1fr)_minmax(140px,0.7fr)_minmax(140px,0.7fr)_minmax(140px,0.7fr)_auto] xl:items-end">
				<label>
					<span className={`${fieldLabelClass} mb-2`}>Company ticker</span>
					<input
						value={ticker}
						onChange={(event) => setTicker(event.target.value.toUpperCase().replace(/[^A-Z0-9.-]/g, "").slice(0, 10))}
						className="h-14 w-full rounded-xl border border-slate-300 bg-white px-4 text-2xl font-semibold uppercase tracking-[0.2em] text-slate-950 outline-none transition placeholder:text-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
						placeholder="AAPL"
						maxLength={10}
						pattern={"[A-Za-z0-9.\\-]{1,10}"}
						required
						aria-label="Company ticker"
					/>
				</label>

				<FormTypeFilter
					activeTicker={activeTicker}
					forms={availableForms}
					selectedForms={filters.forms}
					isLoading={isLoadingForms}
					onChange={(forms) => updateFilters({ forms })}
				/>

				<DateFilter id="from-date" label="From" value={filters.from} max={filters.to || undefined} onChange={(from) => updateFilters({ from })} />
				<DateFilter id="to-date" label="To" value={filters.to} min={filters.from || undefined} onChange={(to) => updateFilters({ to })} />

				<label>
					<span className={`${fieldLabelClass} mb-2`}>Sort order</span>
					<select value={filters.sortOrder} onChange={(event) => updateFilters({ sortOrder: event.target.value as SortOrder })} className={`${fieldClass} cursor-pointer`}>
						<option value="desc">Newest first</option>
						<option value="asc">Oldest first</option>
					</select>
				</label>

				<button
					type="submit"
					className="h-12 cursor-pointer rounded-xl bg-slate-950 px-6 text-sm font-semibold text-white transition hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-100"
				>
					Search
				</button>
			</div>
		</form>
	);
}
