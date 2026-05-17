import { apiPost } from "./client";
import type { CheckInRequest } from "../types/requestDto";
import type { CheckInResult } from "../types/requestDto";

export function checkIn(payload: CheckInRequest) {
  return apiPost<CheckInResult, CheckInRequest>("/checkin", payload);
}
