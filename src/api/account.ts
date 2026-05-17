import { apiPut, apiPost } from "./client";
import type { Response } from "../types/requestDto";
import type {
  UpdateEmailRequest,
  UpdateNameRequest,
  UpdatePasswordRequest,
} from "../types/requestDto";

export function changeEmail(payload: UpdateEmailRequest) {
  return apiPut<Response<{}>, UpdateEmailRequest>("/account/email", payload);
}

export function logoutAllDevices() {
  return apiPost<Response<{}>>("/account/logout-all");
}

export function changeName(payload: UpdateNameRequest) {
  return apiPut<Response<{}>, UpdateNameRequest>("/account/name", payload);
}

export function changePassword(payload: UpdatePasswordRequest) {
  return apiPut<Response<{}>, UpdatePasswordRequest>("/account/password", payload);
}
