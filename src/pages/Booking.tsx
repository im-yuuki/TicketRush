import { useState, useCallback, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { ArrowLeft, CalendarDays, MapPin } from "lucide-react";
import { Button } from "@heroui/react";
import SeatMap, { type VenueLayout } from "../components/SeatMap";
import { getEvent } from "../data/events";
import { apiGet } from "../api/client";
import { formatPrice, formatDateTime } from "../utils/format";
import { useBooking } from "../contexts/BookingContext";

// Mocks layout
import cinemaLayout from "../data/layouts/cinema.json";

export default function Booking() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { setSeatSelection } = useBooking();
  const event = useMemo(() => getEvent(eventId), [eventId]);

  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [bookedSeatIds, setBookedSeatIds] = useState<string[]>([]);

  // 1. Real-time Synchronization (Giả lập WebSockets / Polling)
  useEffect(() => {
    if (!event) return;

    let isMounted = true;
    const fetchBookedSeats = () => {
      apiGet<string[]>(`/events/${event.id}/booked-seats`)
        .then((data) => {
          if (isMounted) setBookedSeatIds(data);
        })
        .catch((_err) => {
          // Nếu chưa có API, nạp 1 lần dữ liệu giả
          if (isMounted && bookedSeatIds.length === 0) {
            console.log("Fallback to mock data for booked seats.");
            setBookedSeatIds(["screen-B-2", "screen-B-3", "screen-C-1"]);
          }
        });
    };

    // Lần đầu tải trang
    fetchBookedSeats();

    // POLING: Tự động tải lại ghế sau mỗi 5 giây.
    // Lưu ý kiến trúc: Khi có Backend, thay đoạn setInterval này bằng WebSockets (VD: socket.on('seat_update', data => ...))
    const interval = setInterval(fetchBookedSeats, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [event]);

  const handleSeatSelection = useCallback((seats: string[]) => {
    setSelectedSeats(seats);
  }, []);

  // 2. Concurrency Control (Xử lý Đụng độ khi Đặt vé)
  const handleBuyTickets = async () => {
    if (selectedSeats.length === 0 || !event) return;

    // Save selection to context (survives page refresh)
    setSeatSelection(event.id, selectedSeats, seatToTierMap);

    // TODO: Tạm thời chuyển thẳng sang BookingDetails
    navigate(`/events/${event.id}/booking-details`);

    /* 
    // === KIỂM TRA API, COMMENT TẠM LẠI ĐỂ TEST UI ===
    setIsBooking(true);
    try {
      await apiPost("/bookings", { eventId: event.id, seats: selectedSeats });
      // Khi API phản hồi thành công, ta chuyển sang trang BookingDetails
      navigate(`/events/${event.id}/booking-details`);
    } catch (err: any) {
      // Kiến trúc Scalable: Xử lý riêng lỗi HTTP 409 Conflict (Trùng ghế)
      const isConflict = err?.status === 409 || err?.response?.status === 409;

      if (isConflict) {
        alert(t("booking.conflictError"));
        // 1. Xóa các ghế bị trùng khỏi giỏ hàng của user (Giả lập: Xóa hết)
        setSelectedSeats([]);
        // 2. Gọi lại API để cập nhật ghế nào vừa biến thành màu đỏ (Booked)
        // fetchBookedSeats(); // (Nếu tách hàm fetch ra ngoài useEffect, bạn gọi ở đây)
      } else {
        alert(t("booking.genericError"));
      }
    } finally {
      setIsBooking(false);
    }
    // =========================================================
    */
  };

  if (!event) return <div className="p-10 text-white">{t("event.notFound")}</div>;

  const { tierColors, seatToTierMap } = useMemo(() => {
    const layout = cinemaLayout as VenueLayout;
    const tColors: Record<string, string> = {};
    const sMap: Record<string, string> = {};

    // 1. Gắn màu tĩnh cho từng Hạng vé
    const colors = ["#ef4444", "#fcd34d", "#a3e635", "#86efac", "#5eead4", "#fca5a5", "#93c5fd"];
    event.ticketTiers.forEach((tier, idx) => {
      tColors[tier.id] = colors[idx % colors.length];
    });

    // 2. Map ID ghế -> ID Hạng vé (để tính tiền)
    layout.blocks.forEach(block => {
      block.rows.forEach(row => {
        // Nếu layout không set tierId, fallback về tier rẻ nhất/đầu tiên
        const tierId = row.tierId || event.ticketTiers[0].id;
        for (let i = 1; i <= row.count; i++) {
          sMap[`${block.id}-${row.label}-${i}`] = tierId;
        }
      });
    });

    return { tierColors: tColors, seatToTierMap: sMap };
  }, [event.ticketTiers]);

  // Tính tổng tiền dựa trên hạng ghế thực tế
  const totalAmount = useMemo(() => {
    return selectedSeats.reduce((sum, seatId) => {
      const tierId = seatToTierMap[seatId];
      const tier = event.ticketTiers.find(t => t.id === tierId);
      return sum + (tier ? tier.price : event.ticketTiers[0].price);
    }, 0);
  }, [selectedSeats, seatToTierMap, event.ticketTiers]);

  return (
    <div className="flex flex-col md:flex-row h-[100dvh] w-full bg-[#0a0a0a] text-white font-sans overflow-hidden">
      {/* ── Cột Trái: Sơ đồ ghế ── */}
      <div className="flex flex-col flex-1 relative border-b md:border-b-0 md:border-r border-white/5 overflow-hidden">
        {/* Header trái */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 md:p-6 bg-gradient-to-b from-black to-transparent">
          <button
            onClick={() => navigate(`/events/${event.id}`)}
            className="flex items-center gap-2 text-(--accent) hover:text-(--accent)/80 font-medium transition-colors shrink-0"
          >
            <ArrowLeft size={20} />
            <span className="hidden md:inline">{t("common.back")}</span>
          </button>
          <h1 className="absolute inset-x-0 text-center text-xl font-bold tracking-wide text-(--accent) pointer-events-none md:static md:inset-auto md:pointer-events-auto">
            {t("booking.selectTicket")}
          </h1>
          <div className="w-24" /> {/* Spacer */}
        </div>

        {/* Bản đồ ghế */}
        <div className="flex-1 flex items-center justify-center pt-24 pb-10 overflow-auto">
          {/* Ta bọc SeatMap trong div custom để ẩn bớt Legend cũ (nếu muốn) hoặc dùng y nguyên */}
          <div className="scale-90 md:scale-100 origin-center">
            <SeatMap
              layout={cinemaLayout as VenueLayout}
              bookedSeatIds={bookedSeatIds}
              onSelectionChange={handleSeatSelection}
              maxSeats={10}
              tierColors={tierColors}
            />
          </div>
        </div>
      </div>

      {/* ── Cột Phải: Thông tin ── */}
      <div className="flex flex-col w-full md:w-[380px] h-auto max-h-[50vh] md:max-h-none md:h-full bg-[#2d2d2d] shrink-0 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] md:shadow-[-10px_0_30px_rgba(0,0,0,0.5)] z-20">
        {/* Thông tin sự kiện */}
        <div className="p-6 border-b border-white/5 hidden md:block">
          <h2 className="text-lg font-bold mb-4 uppercase tracking-wide leading-snug">
            [{event.venue.split(",")[0]}] {event.title}
          </h2>
          <div className="space-y-3 text-sm text-gray-300">
            <div className="flex items-center gap-3">
              <CalendarDays size={18} className="shrink-0 text-white" />
              <span className="font-medium">{formatDateTime(event.date)}</span>
            </div>
            <div className="flex items-start gap-3">
              <MapPin size={18} className="shrink-0 text-(--accent) mt-0.5" />
              <span className="font-medium leading-tight">{event.venue}</span>
            </div>
          </div>
        </div>

        {/* Danh sách giá vé */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar hidden md:block">
          <h3 className="text-sm font-bold mb-5 text-gray-400 uppercase tracking-wider">{t("booking.ticketPrice")}</h3>
          <div className="space-y-4">
            {event.ticketTiers.map((tier) => {
              const color = tierColors[tier.id];
              return (
                <div key={tier.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-4 rounded shadow-sm" style={{ backgroundColor: color }} />
                    <span className="font-medium text-gray-100">{tier.name}</span>
                  </div>
                  <span className="font-bold text-(--accent)">{formatPrice(tier.price)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 md:p-6 bg-[#262626] border-t-0 md:border-t border-white/5">
          {selectedSeats.length > 0 && (
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-gray-300 font-medium">
                {t("booking.ticketsSelected", { count: selectedSeats.length })}
              </span>
              <span className="font-bold text-xl text-(--accent)">
                {formatPrice(totalAmount)}
              </span>
            </div>
          )}
          <Button
            className={`w-full py-6 text-base font-bold transition-all rounded-md ${selectedSeats.length > 0
              ? "bg-(--accent) text-black hover:bg-(--accent)/90 shadow-[0_0_15px_oklch(83.77%_0.1655_81.92_/_0.4)]"
              : "bg-[#e5e5e5] text-gray-500 cursor-not-allowed"
              }`}
            onClick={handleBuyTickets}
            isDisabled={selectedSeats.length === 0}
          >
            {selectedSeats.length > 0 ? t("booking.continue") : t("booking.pleaseSelectTicket")}
          </Button>
        </div>
      </div>
    </div>
  );
}
