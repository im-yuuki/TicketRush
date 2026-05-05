import { apiGet, apiPost } from "./client";
import type {
	AccountResponse,
	LoginRequest,
	LoginResponse,
	RegisterOtpRequest,
	RegisterRequest,
	RegisterResponse,
	Response,
} from "../types/requestDto";


export function registerUser(payload: RegisterRequest) {
	return apiPost<RegisterResponse, RegisterRequest>("/auth/register", payload);
}

export function loginUser(payload: LoginRequest) {
	return apiPost<LoginResponse, LoginRequest>("/auth/login", payload);
}

export function getAccount() {
	return apiGet<AccountResponse>("/account");
}

export function triggerOTPEmail(key: string) {
	return apiGet<Response<{}>>(`/auth/register/${key}`);
}

export function verifyOTPRegister(key: string, payload: RegisterOtpRequest) {
	return apiPost<Response<{}>, RegisterOtpRequest>(`/auth/register/${key}`, payload);
}
