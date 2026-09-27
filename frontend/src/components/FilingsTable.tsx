import { Fragment, useState, type KeyboardEvent } from "react";
import type { CompanyFilingsResponse } from "../../../shared/types";
import { formatBytes, formatDate } from "../utils/formatters";
import { FilingDetails } from "./FilingDetails";
import { PaginationControls } from "./PaginationControls";

type FilingsTableProps = {
	ticker: string;
	response: CompanyFilingsResponse | null;
	isLoading: boolean;
	error: string;
	onPageChange: (page: number) => void;
};

/**
 * Displays filing results and the appropriate empty, loading, or error state.
 *
 * @param ticker - Active company ticker used in table labels.
 * @param response - Current filings response, or `null` while none is available.
 * @param isLoading - Whether the current filings request is in progress.
 * @param error - User-facing request error, or an empty string when successful.
 * @param onPageChange - Called with a one-based page number selected by the user.
 * @returns A filings table with expandable rows and pagination controls.
 */
export function FilingsTable({ ticker, response, isLoading, error, onPageChange }: FilingsTableProps) {
	const [expandedAccession, setExpandedAccession] = useState<string | null>(null);

	function toggleFiling(accessionNumber: string) {
		setExpandedAccession((current) => (current === accessionNumber ? null : accessionNumber));
	}

	function handleRowKeyDown(event: KeyboardEvent<HTMLTableRowElement>, accessionNumber: string) {
		if (event.key === "Enter" || event.key === " ") {
			event.preventDefault();
			toggleFiling(accessionNumber);
		}
	}

	function handlePageChange(page: number) {
		setExpandedAccession(null);
		onPageChange(page);
	}

	if (!ticker) {
		return (
			<div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
				<p className="text-sm font-medium text-slate-700">Enter a ticker to explore its SEC filings.</p>
				<p className="mt-1 text-sm text-slate-400">Try AAPL, SPOT, or JPM.</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700" role="alert">
				{error}
			</div>
		);
	}

	if (isLoading || !response) {
		return (
			<div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
				<div className="mx-auto size-6 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
				<p className="mt-3 text-sm text-slate-500">Loading {ticker} filings…</p>
			</div>
		);
	}

	const { filings, pagination } = response;
	const totalPages = Math.max(1, Math.ceil(pagination.total / pagination.pageSize));

	return (
		<section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
			<div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
				<div>
					<h2 className="font-semibold text-slate-950">{ticker} filings</h2>
					<p className="mt-0.5 text-sm text-slate-500">
						{pagination.total.toLocaleString()} {pagination.total === 1 ? "result" : "results"}
					</p>
				</div>
				<span className="text-sm text-slate-500">
					Page {pagination.page} of {totalPages}
				</span>
			</div>

			{filings.length === 0 ? (
				<div className="px-6 py-16 text-center text-sm text-slate-500">No filings match these filters.</div>
			) : (
				<div className="min-w-0 overflow-hidden">
					<table className="w-full table-fixed border-collapse text-left">
						<thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
							<tr>
								<th className="w-32 px-3 py-3 sm:w-40 sm:px-5">Filed</th>
								<th className="w-20 px-3 py-3 sm:w-28 sm:px-5">Type</th>
								<th className="px-3 py-3 sm:px-5">Document</th>
								<th className="hidden w-40 px-5 py-3 lg:table-cell">Report date</th>
								<th className="hidden w-24 px-5 py-3 text-right md:table-cell">Size</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100">
							{filings.map((filing) => {
								const isExpanded = expandedAccession === filing.accessionNumber;

								return (
									<Fragment key={filing.accessionNumber}>
										<tr
											tabIndex={0}
											aria-expanded={isExpanded}
											onClick={() => toggleFiling(filing.accessionNumber)}
											onKeyDown={(event) => handleRowKeyDown(event, filing.accessionNumber)}
											className={`cursor-pointer transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 ${isExpanded ? "bg-blue-50/50" : "hover:bg-slate-50/70"}`}
										>
											<td className="whitespace-nowrap px-3 py-4 text-sm text-slate-600 sm:px-5">
												<span className="flex items-center gap-3">
													<span className={`text-xs text-slate-400 transition ${isExpanded ? "rotate-90" : ""}`} aria-hidden="true">
														›
													</span>
													{formatDate(filing.filingDate)}
												</span>
											</td>
											<td className="px-3 py-4 sm:px-5">
												<span className="inline-flex rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">{filing.form}</span>
											</td>
											<td className="min-w-0 px-3 py-4 sm:px-5">
												<a
													href={filing.primaryDocumentUrl}
													target="_blank"
													rel="noreferrer"
													onClick={(event) => event.stopPropagation()}
													onKeyDown={(event) => event.stopPropagation()}
													className="inline-block max-w-full truncate text-sm font-medium text-slate-900 hover:text-blue-600 hover:underline"
												>
													{filing.primaryDocDescription || filing.primaryDocument}
												</a>
												<p className="mt-0.5 truncate text-xs text-slate-400">{filing.accessionNumber}</p>
											</td>
											<td className="hidden whitespace-nowrap px-5 py-4 text-sm text-slate-600 lg:table-cell">{formatDate(filing.reportDate)}</td>
											<td className="hidden whitespace-nowrap px-5 py-4 text-right text-sm text-slate-500 md:table-cell">{formatBytes(filing.size)}</td>
										</tr>
										{isExpanded && (
											<tr>
												<td colSpan={5} className="bg-slate-50 px-3 py-4 sm:px-5">
													<FilingDetails filing={filing} />
												</td>
											</tr>
										)}
									</Fragment>
								);
							})}
						</tbody>
					</table>
				</div>
			)}

			<PaginationControls pagination={pagination} onPageChange={handlePageChange} />
		</section>
	);
}
