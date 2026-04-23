// data mẫu để bắn vào event, i vibed

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
  description: DescriptionParagraph[];
  ticketTiers: TicketTier[];
  organizer: string;
  organizerDescription: string;
  /** Optional URL for the organizer logo. */
  organizerLogo?: string;
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
      "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1600&q=80",
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
      { id: "vip1", name: "VIP1", price: 1600000 },
      { id: "vip2", name: "VIP2", price: 1150000 },
      { id: "vip3", name: "VIP3", price: 850000 },
      { id: "vip4", name: "VIP4", price: 600000 },
    ],
    organizer: "CÔNG TY TNHH NGHỆ THUẬT VÀ NHẠC CỤ NGUYỄN DUY",
    organizerDescription:
      "Sóng Nhạc là nơi mà bạn sẽ gặp gỡ những gương mặt ca sĩ nổi tiếng trong nước, cùng nhau phiêu trên sóng nhạc với sự hỗ trợ đắc lực từ hệ thống âm thanh chất lượng cao cấp và hiện đại bậc nhất miền Bắc mà không cần đi đâu xa.",
  },
};

/** Look up a single event by id. Swap this for a real fetch() later. */
export function getEvent(id: string | undefined): EventData | null {
  if (!id) return null;
  // Dev fallback: unknown ids show the "test" event. Remove when wiring real data.
  return MOCK_EVENTS[id] ?? MOCK_EVENTS.test ?? null;
}

/** Get all events (useful for listings, sitemap, etc). */
export function getAllEvents(): EventData[] {
  return Object.values(MOCK_EVENTS);
}
