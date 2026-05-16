export const API_BASE_URL =
	import.meta.env.VITE_API_BASE_URL ||
	(import.meta.env.DEV ? "/v1" : "https://api.ticketrush.june8th.me/v1");
export const AUTH_COOKIE_NAME = import.meta.env.VITE_AUTH_COOKIE_NAME || "access_token";
