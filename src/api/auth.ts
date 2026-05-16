import { apiGet, apiPost } from "./client";
import type {
	AccountResponse,
	LoginRequest,
	LoginResponse,
	RegisterRequest,
	RegisterResponse,
	OTPRequest,
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

export function triggerOTPEmail() {
	return apiGet<Response>("/auth/register/confirmation");
}

export function verifyOTPRegister(payload: OTPRequest) {
	return apiPost<Response, OTPRequest>("/auth/register/confirmation", payload);
}

export function logoutUser() {
	return apiPost<Response>("/auth/logout");
}
