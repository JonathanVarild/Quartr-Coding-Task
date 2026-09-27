type FormTypeFilterProps = {
	activeTicker: string;
	forms: string[];
	selectedForms: string[];
	isLoading: boolean;
	onChange: (forms: string[]) => void;
};

const fieldLabelClass = "block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500";
const fieldClass =
	"h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100";
const clearButtonClass = "text-xs font-semibold text-blue-600 transition hover:text-blue-800 disabled:cursor-not-allowed disabled:text-slate-300";

/**
 * Renders a multi-select dropdown of filing form names.
 *
 * @param activeTicker - Active ticker, used to determine whether forms can be shown.
 * @param forms - Available form names for the active ticker.
 * @param selectedForms - Currently selected form names.
 * @param isLoading - Whether form names are being fetched.
 * @param onChange - Called with the complete next form selection.
 * @returns The form-type dropdown and its clear action.
 */
export function FormTypeFilter({ activeTicker, forms, selectedForms, isLoading, onChange }: FormTypeFilterProps) {
	const sortedForms = [...forms].sort((left, right) => left.localeCompare(right, undefined, { numeric: true }));
	const label = !activeTicker
		? "Select a ticker first"
		: isLoading
			? "Loading forms..."
			: sortedForms.length === 0
				? "None available"
				: selectedForms.length === 0
					? "All filing forms"
					: `${selectedForms.length} selected`;

	function toggleForm(form: string) {
		onChange(selectedForms.includes(form) ? selectedForms.filter((selected) => selected !== form) : [...selectedForms, form]);
	}

	return (
		<div>
			<div className="mb-2 flex items-center justify-between gap-2">
				<span className={fieldLabelClass}>Form type</span>
				<button type="button" onClick={() => onChange([])} disabled={selectedForms.length === 0} className={clearButtonClass}>
					Clear
				</button>
			</div>
			<details className="group relative">
				<summary className={`${fieldClass} flex cursor-pointer list-none items-center justify-between gap-3 [&::-webkit-details-marker]:hidden`}>
					<span className="truncate">{label}</span>
					<span className="flex size-4 items-center justify-center text-slate-400 transition group-open:rotate-180" aria-hidden="true">
						<svg viewBox="0 0 16 16" fill="none" className="size-4" focusable="false">
							<path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
						</svg>
					</span>
				</summary>
				<div className="absolute left-0 z-20 mt-2 max-h-72 w-full min-w-64 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-200/60">
					<div className="border-b border-slate-100 px-2 pb-2">
						<span className="text-xs font-medium text-slate-500">Select filing forms</span>
					</div>
					{!activeTicker ? (
						<p className="px-2 py-4 text-sm leading-5 text-slate-500">Search for a company ticker to load its available filing forms.</p>
					) : isLoading ? (
						<p className="px-2 py-4 text-sm text-slate-500">Loading filing forms…</p>
					) : sortedForms.length === 0 ? (
						<p className="px-2 py-4 text-sm text-slate-500">No filing forms are available for this ticker.</p>
					) : (
						sortedForms.map((form) => (
							<label key={form} className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
								<input
									type="checkbox"
									checked={selectedForms.includes(form)}
									onChange={() => toggleForm(form)}
									className="size-4 rounded border-slate-300 accent-blue-600"
								/>
								{form}
							</label>
						))
					)}
				</div>
			</details>
		</div>
	);
}
