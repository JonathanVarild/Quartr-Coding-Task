import type { CompanyFilingSummary } from "../../../shared/types";
import { formatDate } from "../utils/formatters";

type FilingSummaryTableProps = {
	summary: CompanyFilingSummary | null;
};

/**
 * Displays form counts from the latest twelve months and the latest 10-K date.
 *
 * @param summary - Company summary to display, or `null` before one is available.
 * @returns The summary table, or `null` when no summary has been loaded.
 */
export function FilingSummaryTable({ summary }: FilingSummaryTableProps) {
	if (!summary) return null;

	const formCounts = Object.entries(summary.formCounts).sort(([left], [right]) => left.localeCompare(right, undefined, { numeric: true }));
	const totalFilings = formCounts.reduce((total, [, count]) => total + count, 0);

	return (
		<section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
			<div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-4 sm:px-5">
				<div>
					<h2 className="font-semibold text-slate-950">Filing summary</h2>
					<p className="mt-0.5 text-sm text-slate-500">
						{summary.ticker} · CIK {summary.cik}
					</p>
				</div>
				<div className="text-sm text-slate-500 sm:text-right">
					<p>{totalFilings.toLocaleString()} filings in the last 12 months</p>
					<p className="mt-0.5">
						Latest 10-K: <span className="font-medium text-slate-700">{summary.latest10KDate ? formatDate(summary.latest10KDate) : "Not available"}</span>
					</p>
				</div>
			</div>

			{formCounts.length > 0 ? (
				<table className="w-full text-left">
					<thead className="sr-only">
						<tr>
							<th>Form type</th>
							<th>Occurrences</th>
						</tr>
					</thead>
					<tbody className="grid grid-cols-1 gap-px bg-slate-200 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{formCounts.map(([form, count]) => (
							<tr key={form} className="grid grid-cols-[minmax(0,1fr)_auto] items-center bg-white">
								<td className="truncate px-4 py-3 text-sm font-medium text-slate-800 sm:px-5" title={form}>
									{form}
								</td>
								<td className="min-w-14 px-4 py-3 text-right text-sm tabular-nums text-slate-500 sm:px-5">{count.toLocaleString()}</td>
							</tr>
						))}
					</tbody>
				</table>
			) : (
				<p className="px-4 py-10 text-center text-sm text-slate-500 sm:px-5">No filings were found in the last 12 months.</p>
			)}
		</section>
	);
}
