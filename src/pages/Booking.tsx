import { useState, useCallback, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { ArrowLeft, CalendarDays, MapPin, Armchair } from "lucide-react";
import { Button, Skeleton } from "@heroui/react";
import SeatMap from "../components/SeatMap";
import { Logo } from "../components/Branding";
import { getEvent, fetchEventById } from "../data/events";
import { formatPrice, formatDateTime } from "../utils/format";
import { useBooking } from "../contexts/BookingContext";
import { getSeatConfig } from "../utils/organizer/organizerSeatLayoutStorage";
import { buildLayoutFromTiers } from "../utils/seatLayoutBuilder";
import type { TierDimensions } from "../types/seat";

const TIER_COLORS = ["#ef4444", "#fcd34d", "#a3e635", "#86efac", "#5eead4", "#fca5a5", "#93c5fd", "#c084fc", "#fb923c"];

// Mock booked seats — will be replaced by server API
function getMockBookedSeats(tierId: string): string[] {
  return [`${tierId}-B-2`, `${tierId}-B-3`, `${tierId}-C-1`];
}

type TierInfo = TierDimensions & { price: number; color: string; seatCount: number };

export default function Booking() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { setSeatSelection } = useBooking();

  const localEvent = useMemo(() => getEvent(eventId), [eventId]);
  const [serverEvent, setServerEvent] = useState<typeof localEvent>(null);
  const shouldFetch = !localEvent && !!eventId && /^\d+$/.test(eventId);
  const [loading, setLoading] = useState(shouldFetch);

  useEffect(() => {
    if (!shouldFetch) return;
    let cancelled = false;
    fetchEventById(eventId!).then((result) => {
      if (!cancelled) {
        setServerEvent(result);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [eventId, shouldFetch]);

  const event = localEvent ?? serverEvent;

  // Load seat config from localStorage (saved by organizer)
  const tierDims = useMemo(() => {
    if (!eventId) return [];
    return getSeatConfig(eventId) ?? [];
  }, [eventId]);

  // Build tier info with colors and prices from event tickets
  const tiers = useMemo(() => {
    if (!event?.showTimes?.[0]) return [];
    const showTime = event.showTimes[0];
    return tierDims.map((dim, idx) => {
      const ticket = showTime.tickets.find((t) => `${showTime.id}-${t.id}` === dim.tierId);
      return {
        ...dim,
        price: ticket ? (ticket.isFree ? 0 : Number(String(ticket.price).replace(/[^\d]/g, "")) || 0) : 0,
        color: TIER_COLORS[idx % TIER_COLORS.length],
        seatCount: dim.rows * dim.cols,
      };
    });
  }, [tierDims, event]);

  // Selected tier state
  const [selectedTier, setSelectedTier] = useState<TierInfo | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  // Build seatmap layout for selected tier
  const seatLayout = useMemo(() => {
    if (!selectedTier) return null;
    return buildLayoutFromTiers([selectedTier]);
  }, [selectedTier]);

  // Booked seats for current tier (mock)
  const bookedSeatIds = useMemo(() => {
    if (!selectedTier) return [];
    return getMockBookedSeats(selectedTier.tierId);
  }, [selectedTier]);

  // Assigned colors for seatmap (all seats same color = same tier)
  const assignedSeatColors = useMemo(() => {
    if (!selectedTier || !seatLayout) return {};
    const colors: Record<string, string> = {};
    const blockId = seatLayout.blocks[0]?.id;
    if (!blockId) return colors;
    for (const row of seatLayout.blocks[0].rows) {
      for (let i = 1; i <= row.count; i++) {
        colors[`${blockId}-${row.label}-${i}`] = selectedTier.color;
      }
    }
    return colors;
  }, [selectedTier, seatLayout]);

  // Max seats per purchase (from server salesRound.maxTicketsPerPurchase, hardcoded for now)
  const MAX_SEATS = 10;

  const totalAmount = useMemo(
    () => selectedSeats.length * (selectedTier?.price ?? 0),
    [selectedSeats, selectedTier],
  );

  // Full venue address
  const fullAddress = useMemo(() => {
    if (!event) return "";
    return [event.venue, event.address].filter(Boolean).join(", ");
  }, [event]);

  // Select a tier → show seatmap
  const handleSelectTier = useCallback((tier: TierInfo) => {
    setSelectedTier(tier);
    setSelectedSeats([]);
  }, []);

  // Back to tier list
  const handleBackToTiers = useCallback(() => {
    setSelectedTier(null);
    setSelectedSeats([]);
  }, []);

  // Continue to booking details
  const handleContinue = useCallback(() => {
    if (selectedSeats.length === 0 || !event || !selectedTier) return;
    setSeatSelection(event.id, selectedSeats, selectedTier.tierId, selectedTier.name, selectedTier.price);
    navigate(`/events/${event.id}/booking-details`);
  }, [selectedSeats, event, selectedTier, setSeatSelection, navigate]);

  if (loading) {
    return (
      <div className="flex flex-col h-[100dvh] w-full bg-[#0a0a0a] text-white font-sans">
        <div className="p-6 space-y-4">
          <Skeleton className="h-6 w-48 rounded-lg" />
          <Skeleton className="h-10 w-72 rounded-lg" />
          <Skeleton className="h-8 w-56 rounded-lg" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!event) return <div className="p-10 text-white">{t("event.notFound")}</div>;

  // ── Step 1: Pick a tier ──
  if (!selectedTier) {
    return (
      <div className="flex flex-col h-[100dvh] w-full bg-[#0a0a0a] text-white font-sans overflow-hidden">
        {/* Header */}
        <header className="relative shrink-0 flex items-center justify-between px-4 md:px-8 py-3 bg-[#111] border-b border-white/5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/events/${event.id}`)}
              className="flex shrink-0 items-center gap-2 text-(--accent) hover:text-(--accent)/80 font-semibold transition-colors text-sm"
            >
              <ArrowLeft size={18} />
              <span className="hidden md:inline">{t("common.back", "Trở về")}</span>
            </button>
            <div className="hidden md:block h-5 w-px bg-white/15" />
            <Link to="/">
              <Logo className="hidden md:flex text-2xl md:text-3xl" />
            </Link>
          </div>
          <Link
            to="/"
            className="pointer-events-auto absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-center md:hidden"
          >
            <Logo className="text-2xl" />
          </Link>
          <div className="w-20" />
        </header>

        {/* Event info centered */}
        <div className="shrink-0 text-center px-6 py-6 border-b border-white/5">
          <h2 className="text-lg md:text-xl font-bold mb-3 leading-snug max-w-xl mx-auto">{event.title}</h2>
          <div className="flex flex-col items-center gap-1.5 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <CalendarDays size={14} className="text-gray-500" />
              <span>{formatDateTime(event.date)}</span>
            </div>
            <div className="flex items-start gap-2">
              <MapPin size={14} className="text-gray-500 mt-0.5 shrink-0" />
              <span className="leading-relaxed">{fullAddress || event.venue}</span>
            </div>
          </div>
        </div>

        {/* Tier cards */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-6 max-w-lg mx-auto">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-5">
              {t("booking.chooseTier", "Chọn hạng vé")}
            </h3>
            {tiers.length === 0 ? (
              <p className="text-sm text-gray-500">{t("booking.noTiers", "Chưa có cấu hình ghế cho sự kiện này.")}</p>
            ) : (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}
                className="space-y-3"
              >
                {tiers.map((tier) => (
                  <motion.button
                    key={tier.tierId}
                    type="button"
                    onClick={() => handleSelectTier(tier)}
                    variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.985 }}
                    className="group flex items-stretch w-full rounded-xl border border-white/8 bg-[#141414] hover:bg-[#1c1c1c] hover:border-white/15 text-left transition-all overflow-hidden"
                  >
                    {/* Color strip */}
                    <div className="w-1.5 shrink-0" style={{ backgroundColor: tier.color }} />

                    {/* Content */}
                    <div className="flex items-center gap-4 flex-1 px-4 py-4">
                      {/* Seat icon */}
                      <div
                        className="size-11 shrink-0 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: tier.color + "18" }}
                      >
                        <Armchair size={20} style={{ color: tier.color }} />
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-white text-sm">{tier.name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-xs text-gray-500">{tier.seatCount} {t("booking.seats", "ghế")}</span>
                          <span className="text-xs text-gray-600">·</span>
                          <span className="text-xs text-gray-500">{tier.rows}×{tier.cols}</span>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="text-right shrink-0">
                        <p className="text-base font-bold text-(--accent) leading-tight">{formatPrice(tier.price)}</p>
                        <p className="text-[0.65rem] text-gray-600 mt-0.5">{t("booking.perSeat", "/ ghế")}</p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Step 2: Pick seats within selected tier ──
  return (
    <div className="flex flex-col md:flex-row h-[100dvh] w-full bg-[#0a0a0a] text-white font-sans overflow-hidden">
      {/* Left: Seatmap */}
      <div className="flex flex-col flex-1 relative border-b md:border-b-0 md:border-r border-white/5 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 md:p-6 bg-gradient-to-b from-black to-transparent">
          <button
            onClick={handleBackToTiers}
            className="flex items-center gap-2 text-(--accent) hover:text-(--accent)/80 font-medium transition-colors shrink-0"
          >
            <ArrowLeft size={20} />
            <span className="hidden md:inline">{t("common.back", "Trở về")}</span>
          </button>
          <h1 className="absolute inset-x-0 text-center text-lg md:text-xl font-bold tracking-wide text-(--accent) pointer-events-none md:static md:inset-auto md:pointer-events-auto">
            {selectedTier.name}
          </h1>
          <div className="w-20" />
        </div>

        <div className="flex-1 flex items-center justify-center pt-24 pb-10 overflow-auto">
          {seatLayout && (
            <div className="scale-90 md:scale-100 origin-center">
              <SeatMap
                layout={seatLayout}
                bookedSeatIds={bookedSeatIds}
                onSelectionChange={setSelectedSeats}
                maxSeats={MAX_SEATS}
                assignedSeatColors={assignedSeatColors}
              />
            </div>
          )}
        </div>
      </div>

      {/* Right: Info */}
      <div className="flex flex-col w-full md:w-[380px] h-auto max-h-[50vh] md:max-h-none md:h-full bg-[#2d2d2d] shrink-0 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] md:shadow-[-10px_0_30px_rgba(0,0,0,0.5)] z-20">
        {/* Event info (desktop) */}
        <div className="p-6 border-b border-white/5 hidden md:block">
          <h2 className="text-base font-bold mb-3 uppercase tracking-wide leading-snug">{event.title}</h2>
          <div className="space-y-2.5 text-sm text-gray-300">
            <div className="flex items-center gap-3">
              <CalendarDays size={16} className="shrink-0 text-gray-400" />
              <span className="font-medium">{formatDateTime(event.date)}</span>
            </div>
            <div className="flex items-start gap-3">
              <MapPin size={16} className="shrink-0 text-(--accent) mt-0.5" />
              <span className="font-medium leading-relaxed">{fullAddress || event.venue}</span>
            </div>
          </div>
        </div>

        {/* Tier info */}
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="size-5 rounded" style={{ backgroundColor: selectedTier.color }} />
            <span className="font-bold text-white text-sm">{selectedTier.name}</span>
          </div>
          <p className="text-sm text-gray-400">
            {formatPrice(selectedTier.price)} {t("booking.perSeat", "/ ghế")}
          </p>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bottom actions */}
        <div className="p-4 md:p-6 bg-[#262626] border-t-0 md:border-t border-white/5">
          {selectedSeats.length > 0 && (
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-gray-300 font-medium">
                {t("booking.ticketsSelected", { count: selectedSeats.length })}
              </span>
              <span className="font-bold text-xl text-(--accent)">{formatPrice(totalAmount)}</span>
            </div>
          )}
          <Button
            className={`w-full py-6 text-base font-bold transition-all rounded-md ${
              selectedSeats.length > 0
                ? "bg-(--accent) text-black hover:bg-(--accent)/90 shadow-[0_0_15px_oklch(83.77%_0.1655_81.92_/_0.4)]"
                : "bg-[#e5e5e5] text-gray-500 cursor-not-allowed"
            }`}
            onClick={handleContinue}
            isDisabled={selectedSeats.length === 0}
          >
            {selectedSeats.length > 0
              ? t("booking.continue", "Tiếp tục")
              : t("booking.pleaseSelectTicket", "Vui lòng chọn ghế")}
          </Button>
        </div>
      </div>
    </div>
  );
}
