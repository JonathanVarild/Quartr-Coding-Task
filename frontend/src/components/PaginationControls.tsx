import { useEffect, useState, type FormEvent } from "react";
import type { Pagination } from "../../../shared/types";

type PaginationControlsProps = {
	pagination: Pagination;
	onPageChange: (page: number) => void;
};

/** Builds a compact page list while keeping the first, last, and nearby pages visible. */
function getPageItems(currentPage: number, totalPages: number): (number | "start-ellipsis" | "end-ellipsis")[] {
	if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);
	if (currentPage <= 4) return [1, 2, 3, 4, 5, "end-ellipsis", totalPages];
	if (currentPage >= totalPages - 3) return [1, "start-ellipsis", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
	return [1, "start-ellipsis", currentPage - 1, currentPage, currentPage + 1, "end-ellipsis", totalPages];
}

/**
 * Renders direct page controls and a validated page-number input.
 *
 * @param pagination - Current one-based page, page size, and total result count.
 * @param onPageChange - Called with a clamped one-based page number.
 * @returns Responsive pagination controls and the current result range.
 */
export function PaginationControls({ pagination, onPageChange }: PaginationControlsProps) {
	const { page, pageSize, total } = pagination;
	const totalPages = Math.max(1, Math.ceil(total / pageSize));
	const [pageInput, setPageInput] = useState(String(page));
	const firstResult = total === 0 ? 0 : (page - 1) * pageSize + 1;
	const lastResult = Math.min(page * pageSize, total);
	const buttonClass =
		"size-9 cursor-pointer place-items-center rounded-lg border text-sm font-medium transition focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-35";

	useEffect(() => setPageInput(String(page)), [page]);

	function handlePageSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const requestedPage = Number(pageInput);

		if (!Number.isInteger(requestedPage)) {
			setPageInput(String(page));
			return;
		}

		const nextPage = Math.min(Math.max(requestedPage, 1), totalPages);
		setPageInput(String(nextPage));
		onPageChange(nextPage);
	}

	return (
		<div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-4 sm:px-5">
			<p className="text-sm text-slate-500">
				Showing {firstResult.toLocaleString()}–{lastResult.toLocaleString()} of {total.toLocaleString()}
			</p>

			<div className="flex flex-wrap items-center gap-3">
				<nav className="flex items-center gap-1" aria-label="Pagination">
					<button
						type="button"
						disabled={page <= 1}
						onClick={() => onPageChange(1)}
						className={`${buttonClass} hidden border-slate-200 text-slate-600 hover:bg-slate-50 sm:grid`}
						aria-label="First page"
					>
						«
					</button>
					<button
						type="button"
						disabled={page <= 1}
						onClick={() => onPageChange(page - 1)}
						className={`${buttonClass} grid border-slate-200 text-slate-600 hover:bg-slate-50`}
						aria-label="Previous page"
					>
						‹
					</button>

					{getPageItems(page, totalPages).map((item) =>
						typeof item === "number" ? (
							<button
								type="button"
								key={item}
								onClick={() => onPageChange(item)}
								className={`${buttonClass} ${item === page ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 text-slate-700 hover:bg-slate-50"} ${item === page ? "grid" : "hidden sm:grid"}`}
								aria-current={item === page ? "page" : undefined}
								aria-label={`Page ${item}`}
							>
								{item}
							</button>
						) : (
							<span key={item} className="hidden size-7 place-items-center text-sm text-slate-400 sm:grid" aria-hidden="true">
								…
							</span>
						),
					)}

					<button
						type="button"
						disabled={page >= totalPages}
						onClick={() => onPageChange(page + 1)}
						className={`${buttonClass} grid border-slate-200 text-slate-600 hover:bg-slate-50`}
						aria-label="Next page"
					>
						›
					</button>
					<button
						type="button"
						disabled={page >= totalPages}
						onClick={() => onPageChange(totalPages)}
						className={`${buttonClass} hidden border-slate-200 text-slate-600 hover:bg-slate-50 sm:grid`}
						aria-label="Last page"
					>
						»
					</button>
				</nav>

				<form onSubmit={handlePageSubmit} className="ml-auto flex items-center gap-2 sm:ml-0">
					<label htmlFor="page-number" className="hidden whitespace-nowrap text-sm text-slate-500 sm:block">
						Go to page
					</label>
					<input
						id="page-number"
						type="number"
						min={1}
						max={totalPages}
						value={pageInput}
						onChange={(event) => setPageInput(event.target.value)}
						onFocus={(event) => event.currentTarget.select()}
						className="h-9 w-16 rounded-lg border border-slate-200 px-2 text-center text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
					/>
					<button
						type="submit"
						className="h-9 cursor-pointer rounded-lg bg-slate-950 px-3 text-sm font-semibold text-white transition hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-100"
					>
						Go
					</button>
				</form>
			</div>
		</div>
	);
}
