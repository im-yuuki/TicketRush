// data mẫu để bắn vào event, i vibed

import {
  getStoredOrganizerEventPreviewId,
  organizerEventsService,
  type StoredOrganizerEvent,
} from "../api/organizerEventsService";
import { getPurchaseEvent } from "../api/purchaseApi";
import { getEventInfo, getOrganizationInfo } from "../api/public";
import type { PublicEventInfo, PublicOrganizationInfo } from "../types/requestDto";
import type { ShowTime, TicketTypeData } from "../types/organizerCreate";
import type { PurchaseEventView } from "../types/seat";

export type DescriptionParagraph = {
  text: string;
  /** Render paragraph in bold. Defaults to false. */
  bold?: boolean;
};

export type TicketTier = {
  id: string;
  name: string;
  price: number;
};

export type EventData = {
  id: string;
  title: string;
  category: string;
  /** ISO string for the event start time. */
  date: string;
  /** Optional ISO string for the event end time (for multi-day events). */
  endDate?: string;
  location: string;
  venue: string;
  address?: string;
  /** Starting/minimum ticket price in VND. */
  price: number;
  /** URL to the hero/poster image. */
  image: string;
  imageKey?: string;
  description: DescriptionParagraph[];
  ticketTiers: TicketTier[];
  organizer: string;
  organizerDescription: string;
  /** Optional URL for the organizer logo. */
  organizerLogo?: string;
  /** Optional key to load organizer logo from local storage. */
  organizerLogoKey?: string;
  /** Show times for organizer events (displayed in preview after save). */
  showTimes?: ShowTime[];
};

const MOCK_EVENTS: Record<string, EventData> = {
  test: {
    id: "test",
    title: "[HAI PHONG] JIMMII NGUYỄN - Thanh âm của ký ức",
    category: "music",
    date: "2026-04-10T20:00:00",
    endDate: "2026-05-16T22:00:00",
    location: "Hải Phòng",
    venue: "Cung Văn hóa Hữu Nghị Việt Tiệp",
    address: "Số 53 Lạch Tray, Phường Gia Viên, Thành phố Hải Phòng",
    price: 600000,
    image:
      "https://salt.tkbcdn.com/ts/ds/db/d9/6b/7ef0f96eb6bc673df8fd0a7163f1a640.jpg",
    description: [
      { text: "Liveshow JIMMII NGUYỄN | THANH ÂM CỦA KÝ ỨC | 16.05.2026", bold: true },
      { text: "Có những cái tên chỉ cần nhắc đến thôi, là cả một thời thanh xuân như quay trở lại." },
      {
        text: 'Jimmii Nguyễn – giọng ca, nhạc sĩ gắn liền với những bản tình ca bất hủ như "Mãi mãi bên em", "Nhớ về em", "Hoa bằng lăng", "Tình như lá bay xa"…',
      },
      {
        text: "Không ồn ào, không chạy theo xu hướng, âm nhạc của Jimmii Nguyễn luôn mang một màu sắc rất riêng – đầy tự sự, sâu lắng và chạm đến những cảm xúc thật nhất của người nghe.",
      },
      {
        text: "Trong Sóng Nhạc Vol.3, Jimmii Nguyễn cùng các khách mời đặc biệt: ca sĩ Ngọc Phạm – ca sĩ Thu Ba – Jimmi Band, không chỉ hát, mà còn kể lại những câu chuyện – về tình yêu, ký ức và những điều đã đi qua.",
      },
      { text: "Một không gian âm nhạc live." },
      { text: "Một giọng hát từng gắn bó với nhiều thế hệ." },
      {
        text: "Và những ca khúc mà có thể… bạn đã từng nghe trong một giai đoạn rất đặc biệt của cuộc đời mình.",
      },
      { text: "THÔNG TIN SÓNG NHẠC VOL.03 – LIVESHOW JIMMII NGUYỄN", bold: true },
      { text: "Thời gian: 19:30 Thứ 7, ngày 16/05/2026" },
      { text: "Địa điểm: Cung Văn hóa Hữu Nghị Việt Tiệp" },
    ],
    ticketTiers: [
      { id: "svip", name: "SVIP", price: 1950000 },
      { id: "vip1", name: "VIP111", price: 1600000 },
      { id: "vip2", name: "VIP2", price: 1150000 },
      { id: "vip3", name: "VIP3", price: 850000 },
      { id: "vip4", name: "VIP4", price: 600000 },
    ],
    organizer: "CÔNG TY TNHH NGHỆ THUẬT VÀ NHẠC CỤ NGUYỄN DUY",
    organizerDescription:
      "Sóng Nhạc là nơi mà bạn sẽ gặp gỡ những gương mặt ca sĩ nổi tiếng trong nước, cùng nhau phiêu trên sóng nhạc với sự hỗ trợ đắc lực từ hệ thống âm thanh chất lượng cao cấp và hiện đại bậc nhất miền Bắc mà không cần đi đâu xa.",
  },
};

function mapStoredOrganizerEventToEventData(event: StoredOrganizerEvent): EventData {
  const previewId = getStoredOrganizerEventPreviewId(event);
  const ticketTiers =
    event.ticketTiers && event.ticketTiers.length > 0
      ? event.ticketTiers
      : [
          {
            id: "preview",
            name: "Thông tin vé",
            price: 0,
          },
        ];
  const prices = ticketTiers.map((ticketTier) => ticketTier.price);

  // Determine venue and address based on location mode
  const isOnline = event.locationMode === "online";
  const venue = isOnline
    ? "Online"
    : event.venueName || "Sự kiện đang chờ duyệt";

  // Build full address from street + ward + province
  let address: string | undefined;
  let location = "TicketRush";
  if (!isOnline) {
    const addressParts = [
      event.streetAddress,
      event.wardName,
      event.provinceName,
    ].filter(Boolean);
    address = addressParts.length > 0
      ? addressParts.join(", ")
      : "Trang preview dành cho ban tổ chức";
    location = event.provinceName || "TicketRush";
  } else {
    location = "Online";
  }

  // Build event description from stored text (split by newlines into paragraphs)
  const descriptionText = event.eventDescription?.trim();
  const description: DescriptionParagraph[] = descriptionText
    ? descriptionText.split("\n").filter(Boolean).map((line) => ({ text: line }))
    : [
        {
          text: "Đây là trang preview của sự kiện đang chờ duyệt. Nội dung chi tiết sẽ được hiển thị sau khi ban tổ chức hoàn tất thông tin sự kiện.",
        },
      ];

  return {
    id: `-${previewId}`,
    title: event.title,
    category: "organizer-preview",
    date: event.start,
    endDate: event.end,
    location,
    venue,
    address,
    price: prices.length > 0 ? Math.min(...prices) : 0,
    image: event.bannerImageUrl || "",
    imageKey: event.bannerImageKey,
    description,
    ticketTiers,
    organizer: event.organizerName || "TicketRush Organizer",
    organizerDescription:
      event.organizerDescription || "Thông tin ban tổ chức sẽ được cập nhật từ biểu mẫu tạo sự kiện.",
    organizerLogo: event.organizerLogoUrl,
    organizerLogoKey: event.organizerLogoKey,
    showTimes: event.showTimes,
  };
}

function getOrganizerPreviewIdFromRoute(id: string): string | null {
  if (id.startsWith("-")) {
    const previewId = id.slice(1);
    return previewId || null;
  }

  const slugMatch = id.match(/^[a-z0-9][a-z0-9-]*-(\d+)$/i);
  return slugMatch?.[1] ?? null;
}

/** Look up a single event by id. Swap this for a real fetch() later. */
export function getEvent(id: string | undefined): EventData | null {
  if (!id) return null;
  const normalizedId = id.trim();
  const isExplicitPreviewRoute = normalizedId.startsWith("-");
  const previewId = getOrganizerPreviewIdFromRoute(normalizedId);
  if (isExplicitPreviewRoute || previewId) {
    if (!previewId) return null;
    const storedOrganizerEvent = organizerEventsService.findByPreviewId(previewId);
    return storedOrganizerEvent ? mapStoredOrganizerEventToEventData(storedOrganizerEvent) : null;
  }

  // Numeric IDs need async fetch — return null here, caller should use fetchEventById
  if (/^\d+$/.test(normalizedId)) return null;

  // Dev fallback: unknown ids show the "test" event. Remove when wiring real data.
  return MOCK_EVENTS[normalizedId] ?? MOCK_EVENTS.test ?? null;
}

/** Map combined backend data (PublicEventInfo + PurchaseEventView + OrgInfo) to frontend EventData */
function mapServerDataToEventData(
  info: PublicEventInfo,
  purchaseInfo: PurchaseEventView | null,
  orgInfo: PublicOrganizationInfo | null,
): EventData {
  // Description
  const descriptionText = info.description?.trim();
  const description: DescriptionParagraph[] = descriptionText
    ? descriptionText.split("\n").filter(Boolean).map((line) => ({ text: line }))
    : [{ text: "Chưa có mô tả cho sự kiện này." }];

  // Ticket tiers from ticketClasses
  const ticketTiers: TicketTier[] = purchaseInfo?.ticketClasses?.map((tc) => ({
    id: String(tc.id),
    name: tc.name,
    price: tc.price,
  })) ?? [];

  // ShowTimes from salesRounds + grouped ticketClasses
  const showTimes: ShowTime[] | undefined = purchaseInfo?.salesRounds?.map((sr) => {
    const roundTickets: TicketTypeData[] = purchaseInfo.ticketClasses
      ?.filter((tc) => tc.salesRoundId === sr.id)
      .map((tc) => ({
        id: tc.id,
        name: tc.name,
        price: String(tc.price),
        isFree: tc.price === 0,
        totalQuantity: "",
        minPerOrder: "1",
        maxPerOrder: String(sr.maxTicketsPerPurchase),
        saleStart: sr.startTime,
        saleEnd: sr.endTime,
        description: tc.description || "",
      })) ?? [];

    return {
      id: sr.id,
      name: sr.name,
      start: sr.startTime,
      end: sr.endTime,
      tickets: roundTickets,
    };
  });

  // Min price
  const prices = ticketTiers.map((t) => t.price).filter((p) => p > 0);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;

  return {
    id: String(info.id),
    title: info.name,
    category: "event",
    date: info.dateTime,
    location: info.venue,
    venue: info.venue,
    address: info.address || undefined,
    price: minPrice,
    image: info.bannerUrl || "",
    description,
    ticketTiers,
    organizer: info.organizationName || "",
    organizerDescription: orgInfo?.description || "",
    organizerLogo: orgInfo?.avatarUrl || undefined,
    showTimes: showTimes && showTimes.length > 0 ? showTimes : undefined,
  };
}

/** Fetch event from server API by numeric ID */
export async function fetchEventById(id: string | number): Promise<EventData | null> {
  const numericId = typeof id === "string" ? parseInt(id, 10) : id;
  if (!Number.isFinite(numericId) || numericId <= 0) return null;

  try {
    const info = await getEventInfo(numericId);

    // Fetch purchase info and org info in parallel; don't fail if either errors
    const [purchaseInfo, orgInfo] = await Promise.all([
      getPurchaseEvent(numericId).catch(() => null),
      info.organizationId
        ? getOrganizationInfo(info.organizationId).catch(() => null)
        : Promise.resolve(null),
    ]);

    return mapServerDataToEventData(info, purchaseInfo, orgInfo);
  } catch {
    return null;
  }
}

/** Get all events (useful for listings, sitemap, etc). */
export function getAllEvents(): EventData[] {
  return Object.values(MOCK_EVENTS);
}
