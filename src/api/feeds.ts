import { apiGet } from "./client";
import type { BasicEventInfo } from "../types/requestDto";

export function getPromotedEvents() {
  return apiGet<BasicEventInfo[]>("/feeds/promoted");
}

export function getRecommendedEvents() {
  return apiGet<BasicEventInfo[]>("/feeds/recommendeds");
}

export function getTrendingEvents() {
  return apiGet<BasicEventInfo[]>("/feeds/trending");
}
