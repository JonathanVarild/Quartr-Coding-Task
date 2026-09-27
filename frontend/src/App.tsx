import { FilingSummaryTable } from "./components/FilingSummaryTable";
import { FilingsTable } from "./components/FilingsTable";
import { Filters } from "./components/Filters";
import { useFilingsExplorer } from "./hooks/useFilingsExplorer";

/**
 * Composes the filing search controls, results table, and summary view.
 *
 * @returns The root application UI.
 */
export function App() {
	const explorer = useFilingsExplorer();

	return (
		<div className="min-h-screen bg-slate-50 text-slate-900">
			<main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
				<div className="mb-7 max-w-2xl">
					<p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">Filings search</p>
					<h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Find company filings</h1>
					<p className="mt-3 text-sm leading-6 text-slate-500">Search by ticker, narrow the filing type, and choose a filing date range.</p>
				</div>

				<Filters
					activeTicker={explorer.activeTicker}
					availableForms={explorer.availableForms}
					filters={explorer.filters}
					isLoadingForms={explorer.isLoadingForms}
					onSearch={explorer.search}
					onChange={explorer.updateFilters}
				/>

				<div className="mt-6">
					<FilingSummaryTable summary={explorer.summary} />
				</div>

				<div className="mt-6">
					<FilingsTable
						ticker={explorer.activeTicker}
						response={explorer.response}
						isLoading={explorer.isLoadingFilings}
						error={explorer.error}
						onPageChange={explorer.setPage}
					/>
				</div>
			</main>
		</div>
	);
}
