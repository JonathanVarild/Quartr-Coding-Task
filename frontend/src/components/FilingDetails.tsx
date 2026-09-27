import type { ReactNode } from "react";
import type { Filing } from "../../../shared/types";
import { formatBytes } from "../utils/formatters";

/**
 * Renders every available field for an expanded filing row.
 *
 * @param filing - The normalized filing to display.
 * @returns A two-column details table, including a link to the SEC document.
 */
export function FilingDetails({ filing }: { filing: Filing }) {
	const rows: [string, ReactNode][] = [
		["Accession number", filing.accessionNumber],
		["Filing date", filing.filingDate || "—"],
		["Report date", filing.reportDate || "—"],
		["Accepted", filing.acceptanceDateTime || "—"],
		["Act", filing.act || "—"],
		["Form", filing.form || "—"],
		["Core type", filing.coreType || "—"],
		["File number", filing.fileNumber || "—"],
		["Film number", filing.filmNumber || "—"],
		["Items", filing.items.length > 0 ? filing.items.join(", ") : "—"],
		["Size", `${filing.size.toLocaleString()} bytes (${formatBytes(filing.size)})`],
		["XBRL", filing.isXBRL ? "Yes" : "No"],
		["Inline XBRL", filing.isInlineXBRL ? "Yes" : "No"],
		["Numeric XBRL", filing.isXBRLNumeric ? "Yes" : "No"],
		["Primary document", filing.primaryDocument || "—"],
		["Document description", filing.primaryDocDescription || "—"],
		[
			"Original document",
			<a
				href={filing.primaryDocumentUrl}
				target="_blank"
				rel="noreferrer"
				className="break-all font-medium text-blue-600 hover:underline"
				onClick={(event) => event.stopPropagation()}
			>
				{filing.primaryDocumentUrl}
			</a>,
		],
	];

	return (
		<div className="rounded-xl border border-slate-200 bg-white p-4">
			<p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Full filing data</p>
			<div className="overflow-hidden rounded-lg border border-slate-200">
				<table className="w-full table-fixed text-sm">
					<tbody className="divide-y divide-slate-100">
						{rows.map(([label, value]) => (
							<tr key={label}>
								<th className="w-32 bg-slate-50 px-3 py-2.5 text-left align-top font-medium text-slate-500 sm:w-48 sm:px-4">{label}</th>
								<td className="break-words px-3 py-2.5 text-slate-800 sm:px-4">{value}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
