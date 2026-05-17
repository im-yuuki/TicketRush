import { apiGet, apiPatch, apiPut, apiDelete } from "./client";
import type { Response, UpdateUserInfoRequest } from "../types/requestDto";
import type { FullUserInfo } from "../types/requestDto";

export function getUserInfo() {
  return apiGet<FullUserInfo>("/user");
}

export function updateUserInfo(payload: UpdateUserInfoRequest) {
  return apiPatch<Response<{}>, UpdateUserInfoRequest>("/user", payload);
}

export function updateUserAvatar(formData: FormData) {
  return apiPut<Response<{}>, FormData>("/user/avatar", formData);
}

export function followOrganization(id: number) {
  return apiPut<Response<{}>>(`/user/follow/${id}`);
}

export function unfollowOrganization(id: number) {
  return apiDelete<Response<{}>>(`/user/follow/${id}`);
}

export function getPurchasedTickets() {
  return apiGet<Record<string, unknown>>("/user/tickets");
}
