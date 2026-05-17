/**
 * Organizer Events Service
 *
 * Abstraction layer between components and data source.
 * Read operations use localStorage (cached from server).
 * Create/update/delete operations call the backend API.
 */

import {
  readStoredOrganizerEvents,
  findStoredOrganizerEvent,
  findStoredOrganizerEventByPreviewId,
  appendStoredOrganizerEvent,
  updateStoredOrganizerEvent,
  deleteStoredOrganizerEvent,
  reserveNextOrganizerEventSequenceId,
  getStoredOrganizerEventPreviewId,
  ORGANIZER_EVENTS_CHANGE_EVENT,
  ORGANIZER_EVENTS_STORAGE_KEY,
  type StoredOrganizerEvent,
  type StoredOrganizerTicketTier,
} from "../utils/organizer/organizerEventsStorage";
import {
  createEvent,
  updateEvent,
  addSalesRound,
  createSeatZone,
  createTicketClass,
  uploadEventBanner,
  publishEvent,
} from "./organization";

// ── Re-export types so callers import from service only ───

export type { StoredOrganizerEvent, StoredOrganizerTicketTier };
export { getStoredOrganizerEventPreviewId, ORGANIZER_EVENTS_CHANGE_EVENT };

// ── Service Interface ────────────────────────────────────

export interface OrganizerEventsService {
  list(): StoredOrganizerEvent[];
  findById(id: string): StoredOrganizerEvent | undefined;
  findByPreviewId(previewId: string): StoredOrganizerEvent | undefined;
  create(event: StoredOrganizerEvent): void;
  update(id: string, event: StoredOrganizerEvent): void;
  remove(id: string): void;
  reserveNextSequenceId(): number;
}

// ── LocalStorage Implementation ──────────────────────────

function createLocalService(): OrganizerEventsService {
  return {
    list: () => readStoredOrganizerEvents(),
    findById: (id) => findStoredOrganizerEvent(id),
    findByPreviewId: (previewId) => findStoredOrganizerEventByPreviewId(previewId),
    create: (event) => appendStoredOrganizerEvent(event),
    update: (id, event) => updateStoredOrganizerEvent(id, event),
    remove: (id) => deleteStoredOrganizerEvent(id),
    reserveNextSequenceId: () => reserveNextOrganizerEventSequenceId(),
  };
}

// ── Server ID storage (salesRoundIds, seatZoneIds) ───────

const SERVER_IDS_KEY = "ticketrush.organizer.serverIds";

export interface EventServerIds {
  eventId: number;
  salesRoundIds: number[];
  seatZoneIds: number[];
}

function readAllServerIds(): Record<string, EventServerIds> {
  try {
    const raw = window.localStorage.getItem(SERVER_IDS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveServerIds(eventKey: string, ids: EventServerIds) {
  const all = readAllServerIds();
  all[eventKey] = ids;
  window.localStorage.setItem(SERVER_IDS_KEY, JSON.stringify(all));
}

export function getServerIds(eventKey: string): EventServerIds | null {
  return readAllServerIds()[eventKey] ?? null;
}

// ── API Implementation ───────────────────────────────────

const ROW_LABELS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/**
 * Convert datetime-local format "2026-09-09T11:00" to ISO-8601 Instant "2026-09-09T11:00:00Z"
 */
function toIsoInstant(localDatetime: string): string {
	if (!localDatetime) return localDatetime;
	const withSeconds = localDatetime.length === 16 ? `${localDatetime}:00` : localDatetime;
	return withSeconds.endsWith("Z") ? withSeconds : `${withSeconds}Z`;
}

export function buildSeatZonePayload(name: string, rows: number, cols: number) {
  const seatRows = [];
  for (let r = 0; r < rows; r++) {
    const seats = [];
    for (let c = 0; c < cols; c++) {
      seats.push({ index: c, number: r * cols + c + 1 });
    }
    seatRows.push({
      index: r,
      label: ROW_LABELS[r] ?? String(r + 1),
      seats,
    });
  }
  return { name, positionX: 0, positionY: 0, rows: seatRows };
}

export interface CreateEventOnServerParams {
  event: StoredOrganizerEvent;
  bannerFile?: File;
}

export interface CreateEventOnServerResult {
  success: boolean;
  eventId?: number;
  message?: string;
}

/**
 * Event creation via API.
 * 1. POST /organization/events → eventId
 * 2. PATCH /organization/events/{eventId} → description
 * 3. PUT  /organization/events/{eventId}/banner (if banner)
 * 4. POST /organization/events/{eventId}/sales-rounds (×N)
 * 5. Save server IDs + event to localStorage
 *
 * Seat zones + ticket classes are created separately
 * from the seat config page.
 */
export async function createEventOnServer(
  params: CreateEventOnServerParams,
): Promise<CreateEventOnServerResult> {
  const { event, bannerFile } = params;

  // ── Step 1: Create event ──
  const isOnline = event.locationMode === "online";
  const addressParts = [event.streetAddress, event.wardName, event.provinceName].filter(Boolean);
  const address = isOnline ? "Online" : addressParts.join(", ");
  const venue = isOnline ? "Online" : (event.venueName || "TBD");

  // Validate required date — must be in the future
  if (!event.start || isNaN(Date.parse(event.start))) {
    return { success: false, message: "Vui lòng chọn ngày giờ cho sự kiện" };
  }
  if (new Date(event.start) <= new Date()) {
    return { success: false, message: "Ngày giờ sự kiện phải sau thời điểm hiện tại" };
  }

  const createResult = await createEvent({
    name: event.title,
    description: event.eventDescription || "",
    isOnlineEvent: isOnline,
    venue,
    address,
    dateTime: toIsoInstant(event.start),
  });

  if (!createResult.success || !createResult.resourceId) {
    return { success: false, message: createResult.message ?? "Failed to create event" };
  }

  const eventId = createResult.resourceId;

  // ── Step 1b: Patch description (backend createEvent ignores description) ──
  const description = event.eventDescription?.trim();
  if (description) {
    try {
      await updateEvent(eventId, { description });
    } catch (err) {
      console.warn("Description patch failed:", err);
    }
  }

  // ── Step 2: Upload banner (if provided) ──
  if (bannerFile) {
    try {
      await uploadEventBanner(eventId, bannerFile);
    } catch (err) {
      console.warn("Banner upload failed:", err);
    }
  }

  // ── Step 3: Create sales rounds from showTimes ──
  const salesRoundIds: number[] = [];
  const showTimes = event.showTimes ?? [];

  for (const showTime of showTimes) {
    // Validate showTime dates — must be in the future
    if (!showTime.start || isNaN(Date.parse(showTime.start))) {
      return { success: false, message: `Suất diễn "${showTime.name}": thiếu thời gian bắt đầu` };
    }
    if (new Date(showTime.start) <= new Date()) {
      return { success: false, message: `Suất diễn "${showTime.name}": thời gian bắt đầu phải sau hiện tại` };
    }
    if (!showTime.end || isNaN(Date.parse(showTime.end))) {
      return { success: false, message: `Suất diễn "${showTime.name}": thiếu thời gian kết thúc` };
    }
    if (new Date(showTime.end) <= new Date(showTime.start)) {
      return { success: false, message: `Suất diễn "${showTime.name}": thời gian kết thúc phải sau thời gian bắt đầu` };
    }

    const maxPerTicket = showTime.tickets
      .map((t) => parseInt(t.maxPerOrder, 10) || 0)
      .filter((n) => n > 0);
    const maxTickets = maxPerTicket.length > 0 ? Math.max(...maxPerTicket) : 10;

    const roundResult = await addSalesRound(eventId, {
      name: showTime.name,
      startTime: toIsoInstant(showTime.start),
      endTime: toIsoInstant(showTime.end),
      maxTicketsPerPurchase: maxTickets,
    });

    if (!roundResult.success || !roundResult.resourceId) {
      console.error(`Failed to create sales round "${showTime.name}":`, roundResult.message);
      continue;
    }
    salesRoundIds.push(roundResult.resourceId);
  }

  // ── Step 4: Save server IDs for seat config page ──
  const eventKey = String(event.sequenceId ?? eventId);
  saveServerIds(eventKey, {
    eventId,
    salesRoundIds,
    seatZoneIds: [],
  });

  // ── Step 5: Sync event to localStorage for UI caching ──
  const localEvent: StoredOrganizerEvent = {
    ...event,
    id: String(eventId),
    sequenceId: event.sequenceId ?? eventId,
    status: "Chờ duyệt",
    createdAt: event.createdAt || new Date().toISOString(),
  };
  appendStoredOrganizerEvent(localEvent);

  return { success: true, eventId };
}

/**
 * Phase 2: Create seat zones + ticket classes from seat config page.
 * Called when user saves seat configuration.
 */
export async function createSeatZonesOnServer(
  eventId: number,
  eventKey: string,
  tiers: { name: string; rows: number; cols: number; ticketName?: string; price?: number }[],
): Promise<{ success: boolean; message?: string }> {
  // Get server IDs from Phase 1
  const serverIds = getServerIds(eventKey);
  const salesRoundIds = serverIds?.salesRoundIds ?? [];
  const firstSalesRoundId = salesRoundIds[0];

  // ── Guard: need at least one sales round ──
  if (!firstSalesRoundId) {
    return { success: false, message: "Không tìm thấy suất diễn. Hãy tạo sự kiện lại." };
  }

  // ── Guard: don't create duplicate zones ──
  if (serverIds?.seatZoneIds && serverIds.seatZoneIds.length > 0) {
    return { success: true, message: "Seat zones already created" };
  }

  // ── Create seat zones ──
  const seatZoneIds: number[] = [];

  for (let i = 0; i < tiers.length; i++) {
    const tier = tiers[i];
    const zonePayload = buildSeatZonePayload(tier.name, tier.rows, tier.cols);
    // Stagger positionY so zones don't overlap
    zonePayload.positionY = i * 10;
    const zoneResult = await createSeatZone(eventId, zonePayload);

    if (!zoneResult.success || !zoneResult.resourceId) {
      return { success: false, message: zoneResult.message ?? `Failed to create seat zone "${tier.name}"` };
    }
    seatZoneIds.push(zoneResult.resourceId);
  }

  // ── Create ticket classes (link each zone to first sales round) ──
  if (firstSalesRoundId) {
    for (let i = 0; i < tiers.length; i++) {
      const tier = tiers[i];
      const seatZoneId = seatZoneIds[i];
      if (!seatZoneId) continue;

      await createTicketClass(eventId, {
        name: tier.ticketName || tier.name,
        description: tier.ticketName || tier.name,
        price: tier.price ?? 0,
        salesRoundId: firstSalesRoundId,
        seatZoneId,
      });
    }
  }

  // ── Update server IDs with seatZoneIds ──
  if (serverIds) {
    saveServerIds(eventKey, { ...serverIds, seatZoneIds });
  }

  return { success: true };
}

/**
 * Publish event from organizer card.
 * Calls POST /organization/events/{eventId}/publish
 * and updates localStorage.
 */
export async function publishOrganizerEvent(
  eventLocalId: string,
): Promise<{ success: boolean; message?: string }> {
  // Get server eventId
  const serverIds = getServerIds(eventLocalId) ?? getServerIds(String(parseInt(eventLocalId, 10)));
  const numericEventId = serverIds?.eventId ?? parseInt(eventLocalId, 10);

  if (!numericEventId || numericEventId <= 0) {
    return { success: false, message: "Không tìm thấy sự kiện trên server" };
  }

  // Guard: must have seat zones configured
  if (!serverIds?.seatZoneIds || serverIds.seatZoneIds.length === 0) {
    return { success: false, message: "Cần cấu hình sơ đồ ghế trước khi publish" };
  }

  const result = await publishEvent(numericEventId);

  if (!result.success) {
    return { success: false, message: result.message };
  }

  // Update localStorage — mark as published
  const events = readStoredOrganizerEvents();
  const updated = events.map((e) =>
    e.id === eventLocalId ? { ...e, published: true } : e,
  );
  window.localStorage.setItem(ORGANIZER_EVENTS_STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event(ORGANIZER_EVENTS_CHANGE_EVENT));

  return { success: true };
}

// ── Active Service Instance ──────────────────────────────

export const organizerEventsService: OrganizerEventsService = createLocalService();
