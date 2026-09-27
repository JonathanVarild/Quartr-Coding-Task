const dateFormatter = new Intl.DateTimeFormat("en", {
	year: "numeric",
	month: "short",
	day: "numeric",
	timeZone: "UTC",
});

/**
 * Formats an SEC ISO date for display without applying a local timezone shift.
 *
 * @param date - A `YYYY-MM-DD` date string. An empty string represents no date.
 * @returns A localized date such as `Oct 31, 2025`, or an em dash when empty.
 * @throws A {@link RangeError} when a non-empty value is not a valid date.
 */
export function formatDate(date: string): string {
	return date ? dateFormatter.format(new Date(`${date}T00:00:00Z`)) : "—";
}

/**
 * Converts a byte count into a compact decimal size for the filings table.
 *
 * @param bytes - Non-negative file size in bytes.
 * @returns A value expressed in bytes, kilobytes, or megabytes.
 */
export function formatBytes(bytes: number): string {
	if (bytes < 1_000) return `${bytes} B`;
	if (bytes < 1_000_000) return `${Math.round(bytes / 1_000)} KB`;
	return `${(bytes / 1_000_000).toFixed(1)} MB`;
}
