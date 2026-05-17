import { apiGet } from "./client";
import type { PublicOrganizationInfo, PublicEventInfo } from "../types/requestDto";

export function getOrganizationInfoByAlias(alias: string) {
  return apiGet<PublicOrganizationInfo>(`/public/alias/${alias}`);
}

export function getEventInfo(id: number) {
  return apiGet<PublicEventInfo>(`/public/event/${id}`);
}

export function getOrganizationInfo(id: number) {
  return apiGet<PublicOrganizationInfo>(`/public/org/${id}`);
}
