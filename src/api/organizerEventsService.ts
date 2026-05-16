/**
 * Organizer Events Service
 *
 * API-backed abstraction layer between organizer UI and TicketRushServer.
 */

import {
  getStoredOrganizerEventPreviewId,
  ORGANIZER_EVENTS_CHANGE_EVENT,
  type StoredOrganizerEvent,
  type StoredOrganizerTicketTier,
} from "../utils/organizer/organizerEventsStorage";

import {
  getOrganizationEvents,
  getOrganizationEvent,
  createOrganizationEvent,
  updateOrganizationEvent,
  deleteOrganizationEvent,
  publishOrganizationEvent,
  updateEventBanner,
  type BasicEventInfo,
  type FullEventInfo,
  type CreateEventPayload,
  type UpdateEventPayload,
} from "./organizerEvents";

export type { StoredOrganizerEvent, StoredOrganizerTicketTier };
export { getStoredOrganizerEventPreviewId, ORGANIZER_EVENTS_CHANGE_EVENT };

export type OrganizerEventMutationOptions = {
  bannerImageFile?: File | null;
};

export interface OrganizerEventsService {
  list(): Promise<StoredOrganizerEvent[]>;
  findById(id: string): Promise<StoredOrganizerEvent | undefined>;
  findByPreviewId(previewId: string): Promise<StoredOrganizerEvent | undefined>;
  create(event: StoredOrganizerEvent, options?: OrganizerEventMutationOptions): Promise<StoredOrganizerEvent>;
  update(id: string, event: StoredOrganizerEvent, options?: OrganizerEventMutationOptions): Promise<StoredOrganizerEvent>;
  remove(id: string): Promise<void>;
  reserveNextSequenceId(): number;
}

function mapBasicEventToStoredEvent(event: BasicEventInfo): StoredOrganizerEvent {
  return {
    id: String(event.id),
    sequenceId: event.id,
    title: event.name,
    status: "published",
    start: event.dateTime,
    showtimeCount: 0,
    ticketTypeCount: 0,
    createdAt: event.dateTime,
    venueName: event.venue,
    bannerImageUrl: event.bannerUrl,
    locationMode: event.venue === "Online" ? "online" : "offline",
  };
}

function mapFullEventToStoredEvent(event: FullEventInfo): StoredOrganizerEvent {
  return {
    id: String(event.id),
    sequenceId: event.id,
    title: event.name,
    status: event.published ? "published" : "pending",
    start: event.dateTime,
    showtimeCount: 0,
    ticketTypeCount: 0,
    createdAt: event.createdAt,
    venueName: event.isOnlineEvent ? "" : event.venue,
    bannerImageUrl: event.bannerUrl,
    locationMode: event.isOnlineEvent ? "online" : "offline",
    streetAddress: event.isOnlineEvent ? "" : event.address,
    eventDescription: event.description,
  };
}

function dispatchOrganizerEventsChange() {
  window.dispatchEvent(new Event(ORGANIZER_EVENTS_CHANGE_EVENT));
}

function parseBackendEventId(id: string) {
  const eventId = Number(id);
  if (!Number.isInteger(eventId) || eventId <= 0) {
    throw new Error("Event ID is not a backend event ID.");
  }
  return eventId;
}

function toBackendDateTime(value: string | undefined) {
  if (!value) {
    throw new Error("Vui long tao suat dien va chon thoi gian bat dau.");
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Thoi gian su kien khong hop le.");
  }

  return date.toISOString();
}

function buildAddress(event: StoredOrganizerEvent) {
  const addressParts = [
    event.streetAddress,
    event.wardName,
    event.provinceName,
  ]
    .map((part) => part?.trim())
    .filter(Boolean);

  return addressParts.join(", ");
}

function buildEventPayload(event: StoredOrganizerEvent): CreateEventPayload {
  const name = event.title.trim();
  if (!name) {
    throw new Error("Vui long nhap ten su kien.");
  }

  const isOnlineEvent = event.locationMode === "online";
  const venue = isOnlineEvent ? "Online" : event.venueName?.trim() ?? "";
  const address = isOnlineEvent ? "Online" : buildAddress(event);

  if (!venue) {
    throw new Error("Vui long nhap ten dia diem.");
  }

  if (!address) {
    throw new Error("Vui long nhap dia chi su kien.");
  }

  return {
    name,
    description: event.eventDescription?.trim() ?? "",
    isOnlineEvent,
    venue,
    address,
    dateTime: toBackendDateTime(event.start),
  };
}

function buildUpdateEventPayload(event: StoredOrganizerEvent): UpdateEventPayload {
  const payload = buildEventPayload(event);
  const description = payload.description.trim();

  return {
    name: payload.name,
    ...(description ? { description } : {}),
    isOnlineEvent: payload.isOnlineEvent,
    venue: payload.venue,
    address: payload.address,
    dateTime: payload.dateTime,
  };
}

function createApiService(): OrganizerEventsService {
  return {
    async list() {
      const events = await getOrganizationEvents();
      return events.map(mapBasicEventToStoredEvent);
    },

    async findById(id) {
      const event = await getOrganizationEvent(parseBackendEventId(id));
      return mapFullEventToStoredEvent(event);
    },

    async findByPreviewId(previewId) {
      const eventId = Number(previewId);
      if (!Number.isInteger(eventId) || eventId <= 0) {
        return undefined;
      }

      const event = await getOrganizationEvent(eventId);
      return mapFullEventToStoredEvent(event);
    },

    async create(event, options) {
      const result = await createOrganizationEvent(buildEventPayload(event));
      const eventId = result.resourceId;
      if (typeof eventId !== "number") {
        throw new Error("Backend did not return resourceId for created event.");
      }

      const description = event.eventDescription?.trim();
      if (description) {
        await updateOrganizationEvent(eventId, { description });
      }

      if (options?.bannerImageFile) {
        await updateEventBanner(eventId, options.bannerImageFile);
      }

      await publishOrganizationEvent(eventId);

      const createdEvent = mapFullEventToStoredEvent(await getOrganizationEvent(eventId));
      dispatchOrganizerEventsChange();
      return createdEvent;
    },

    async update(id, event, options) {
      const eventId = parseBackendEventId(id);
      await updateOrganizationEvent(eventId, buildUpdateEventPayload(event));

      if (options?.bannerImageFile) {
        await updateEventBanner(eventId, options.bannerImageFile);
      }

      const updatedEvent = mapFullEventToStoredEvent(await getOrganizationEvent(eventId));
      dispatchOrganizerEventsChange();
      return updatedEvent;
    },

    async remove(id) {
      await deleteOrganizationEvent(parseBackendEventId(id));
      dispatchOrganizerEventsChange();
    },

    reserveNextSequenceId: () => Math.floor(Date.now() / 1000),
  };
}

export const organizerEventsService: OrganizerEventsService = createApiService();
