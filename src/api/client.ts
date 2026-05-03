import { API_BASE_URL } from "./config";

/**
 * Error thrown when an API request returns a non-2xx response.
 * `data` contains the parsed response payload when available.
 */
export class ApiError<TError = unknown> extends Error {
	status: number;
	data?: TError;

	constructor(message: string, status: number, data?: TError) {
		super(message);
		this.name = "ApiError";
		this.status = status;
		this.data = data;
	}
}

/**
 * Shared request options for the API wrapper.
 *
 * `TRequest` describes the request payload shape when you send JSON or form data.
 */
export interface ApiRequestOptions<TRequest = unknown>
	extends Omit<RequestInit, "body"> {
	body?: TRequest;
	baseUrl?: string;
}

/**
 * Builds an absolute request URL from a relative endpoint and the configured base URL.
 */
function buildUrl(endpoint: string, baseUrl = API_BASE_URL) {
	return new URL(endpoint.replace(/^\//, ""), baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`).toString();
}

/**
 * Reads a JSON response body when the server sends one.
 * Returns `undefined` for empty responses or non-JSON content.
 */
async function readResponseBody<TResponse>(response: Response): Promise<TResponse | undefined> {
	if (response.status === 204) {
		return undefined;
	}

	const contentType = response.headers.get("content-type") ?? "";
	if (!contentType.includes("application/json")) {
		return undefined;
	}

	return (await response.json()) as TResponse;
}

/**
 * Sends a typed request to the API and returns the parsed response body.
 *
 * - Automatically JSON-stringifies plain objects
 * - Keeps `FormData`, `Blob`, and `URLSearchParams` as-is
 * - Throws `ApiError` for non-2xx responses
 */
export async function apiRequest<TResponse, TRequest = unknown>(
	endpoint: string,
	options: ApiRequestOptions<TRequest> = {},
): Promise<TResponse> {
	const { baseUrl, body, headers, ...init } = options;
	const url = buildUrl(endpoint, baseUrl);
	const requestHeaders = new Headers(headers);

	let requestBody: BodyInit | undefined;
	if (body !== undefined) {
		if (body instanceof FormData || body instanceof Blob || body instanceof URLSearchParams) {
			requestBody = body;
		} else if (typeof body === "string") {
			requestBody = body;
		} else {
			requestHeaders.set("Content-Type", "application/json");
			requestBody = JSON.stringify(body);
		}
	}

	const response = await fetch(url, {
		...init,
		headers: requestHeaders,
		body: requestBody,
	});

	const responseBody = await readResponseBody<TResponse>(response);

	if (!response.ok) {
		const message =
			(responseBody as { message?: string } | undefined)?.message ??
			response.statusText ??
			"Request failed";
		throw new ApiError(message, response.status, responseBody);
	}

	return responseBody as TResponse;
}

/**
 * Convenience helper for typed GET requests.
 */
export async function apiGet<TResponse>(endpoint: string, options: Omit<ApiRequestOptions, "body" | "method"> = {}) {
	return apiRequest<TResponse>(endpoint, { ...options, method: "GET" });
}

/**
 * Convenience helper for typed POST requests.
 */
export async function apiPost<TResponse, TRequest = unknown>(
	endpoint: string,
	body?: TRequest,
	options: Omit<ApiRequestOptions<TRequest>, "body" | "method"> = {},
) {
	return apiRequest<TResponse, TRequest>(endpoint, { ...options, body, method: "POST" });
}
