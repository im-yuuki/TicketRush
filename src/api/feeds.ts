import { apiGet } from "./client";
import type { BasicEventInfo, SearchResult } from "../types/requestDto";

export function getPromotedEvents() {
  return apiGet<BasicEventInfo[]>("/feeds/promoted");
}

export function getRecommendedEvents() {
  return apiGet<BasicEventInfo[]>("/feeds/recommendeds");
}

export function getTrendingEvents() {
  return apiGet<BasicEventInfo[]>("/feeds/trending");
}

export function searchFeeds(q: string, limit = 20) {
  const params = new URLSearchParams({
    q,
    limit: String(limit),
  });

  return apiGet<SearchResult[]>(`/feeds/search?${params.toString()}`);
}
