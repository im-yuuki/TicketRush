import { apiGet, apiPost } from "./client";
import type {
	RegisterOtpRequest,
	RegisterRequest,
	RegisterResponse,
	Response,
} from "../types/requestDto";


export function registerUser(payload: RegisterRequest) {
	return apiPost<RegisterResponse, RegisterRequest>("/auth/register", payload);
}

export function triggerOTPEmail(key: string) {
	return apiGet<Response<{}>>(`/auth/register/${key}`);
}

export function verifyOTPRegister(key: string, payload: RegisterOtpRequest) {
	return apiPost<Response<{}>, RegisterOtpRequest>(`/auth/register/${key}`, payload);
}
