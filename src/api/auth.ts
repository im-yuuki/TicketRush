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
import type { ResetPasswordRequest } from "../types/requestDto";


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
	return apiGet<Response<{}>>("/auth/register/confirmation");
}

export function verifyOTPRegister(payload: OTPRequest) {
	return apiPost<Response<{}>, OTPRequest>("/auth/register/confirmation", payload);
}

export function logoutUser() {
	return apiPost<Response<{}>>("/auth/logout");
}

export function resetPassword(payload: ResetPasswordRequest) {
	return apiPost<Response<{}>, ResetPasswordRequest>("/auth/reset", payload);
}

export function sendResetPasswordOtp() {
	return apiGet<Response<{}>>("/auth/reset/confirm");
}

export function confirmResetPassword(payload: OTPRequest) {
	return apiPost<Response<{}>, OTPRequest>("/auth/reset/confirm", payload);
}
