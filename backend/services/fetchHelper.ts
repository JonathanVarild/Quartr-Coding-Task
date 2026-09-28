const userAgent = "Quartr-Coding-Task jonathan.varild@gmail.com";
const REQUESTS_PER_SEC = 9;

const requestQueue: Array<() => void> = [];
let requestsInCurrentSecond = 0;

function startNewSecond(): void {
	requestsInCurrentSecond = 0;
	requestQueue.splice(0, REQUESTS_PER_SEC).forEach((startRequest) => startRequest());
}

async function waitForRequestSlot(): Promise<void> {
	if (requestsInCurrentSecond >= REQUESTS_PER_SEC) {
		await new Promise<void>((resolve) => requestQueue.push(resolve));
	}

	requestsInCurrentSecond += 1;
	if (requestsInCurrentSecond === 1) {
		setTimeout(startNewSecond, 1000);
	}
}

/** Error raised when a request to the SEC cannot be completed successfully. */
export class SECRequestError extends Error {}

/**
 * Sends a rate-limited request with the identification headers required by the SEC.
 * A maximum of nine requests start per second; additional requests wait in order
 * for the next one-second window.
 *
 * @param url - Absolute resource URL to request.
 * @param options - Standard fetch options. Supplied options may override the default headers.
 * @returns The raw response without interpreting its HTTP status or body.
 * @throws A {@link SECRequestError} when the network request cannot be completed.
 */
export async function fetchWithUserAgent(url: string, options: RequestInit = {}): Promise<Response> {
	await waitForRequestSlot();

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
