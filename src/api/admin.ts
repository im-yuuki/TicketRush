import { apiPost, apiPut } from "./client";
import type { Response, CreateOrganizationRequest } from "../types/requestDto";

export function lockAccount(id: number) {
  return apiPost<Response<{}>>(`/admin/account/${id}/lock`);
}

export function unlockAccount(id: number) {
  return apiPost<Response<{}>>(`/admin/account/${id}/unlock`);
}

export function verifyOrganization(id: number) {
  return apiPost<Response<{}>>(`/admin/organization/${id}/verify`);
}

export function createOrganization(payload: CreateOrganizationRequest) {
  return apiPut<Response<{}>, CreateOrganizationRequest>("/admin/organizations", payload);
}
