const userAgent = "Quartr-Coding-Task jonathan.varild@gmail.com";

/** Error raised when a request to the SEC cannot be completed successfully. */
export class SECRequestError extends Error {}

/**
 * Sends a request with the identification headers required by the SEC.
 *
 * @param url - Absolute resource URL to request.
 * @param options - Standard fetch options. Supplied options may override the default headers.
 * @returns The raw response without interpreting its HTTP status or body.
 * @throws A {@link SECRequestError} when the network request cannot be completed.
 */
export async function fetchWithUserAgent(url: string, options: RequestInit = {}): Promise<Response> {
	try {
		return await fetch(url, {
			headers: {
				"User-Agent": userAgent,
				"Accept-Encoding": "gzip, deflate",
			},
			...options,
		});
	} catch {
		throw new SECRequestError("Failed to reach the SEC.");
	}
}
