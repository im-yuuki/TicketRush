import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Ticket,
} from "lucide-react";
import { Card, Button, TextField, Label, Input, FieldError, Form } from "@heroui/react";
import { getEvent } from "../data/events";
import { Logo } from "../components/Branding";

/* ── Helpers ── */
function formatPrice(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())} - ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

/* ── Countdown Timer hook (mock 10 phút giữ vé) ── */
function useCountdown(seconds: number) {
  const [remaining, setRemaining] = useState(seconds);
  useEffect(() => {
    if (remaining <= 0) return;
    const id = setInterval(() => setRemaining((r) => r - 1), 1000);
    return () => clearInterval(id);
  }, [remaining]);
  const m = Math.floor(remaining / 60);
  const s = remaining % 60;
  return { m, s, expired: remaining <= 0 };
}

/* ── Step Indicator ── */
const STEPS = [
  "payment.stepSelectTicket",
  "payment.stepEnterInfo",
  "payment.stepPayment",
] as const;

function StepIndicator({ current }: { current: number }) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-1 md:gap-2">
      {STEPS.map((key, idx) => {
        const done = idx < current;
        const active = idx === current;
        return (
          <div key={key} className="flex items-center gap-1 md:gap-2">
            <div
              className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0 transition-colors ${done
                  ? "bg-emerald-500 text-white"
                  : active
                    ? "bg-(--accent) text-black"
                    : "bg-white/10 text-white/40"
                }`}
            >
              {done ? <Check size={14} /> : idx + 1}
            </div>
            <span
              className={`text-xs md:text-sm font-medium whitespace-nowrap transition-colors ${active
                  ? "text-(--accent)"
                  : done
                    ? "text-emerald-400"
                    : "text-white/40"
                }`}
            >
              {t(key)}
            </span>
            {idx < STEPS.length - 1 && (
              <div
                className={`w-6 md:w-10 h-px ${done ? "bg-emerald-500" : "bg-white/15"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Scrolling Marquee ── */
function EventMarquee({ text }: { text: string }) {
  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-indigo-900/60 py-1.5 border-y border-white/5">
      <div className="flex animate-[marquee_30s_linear_infinite] whitespace-nowrap">
        {[...Array(4)].map((_, i) => (
          <span
            key={i}
            className="mx-12 text-xs text-white/60 font-medium tracking-wide"
          >
            <Ticket size={12} className="inline mr-2 text-(--accent)" />
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── Collapsible Section (dùng chung cho cả 2 cột) ── */
function Section({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-white/5 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 px-6 text-left hover:bg-white/[0.02] transition-colors"
      >
        <h3 className="text-sm font-bold text-white/90 uppercase tracking-wider">
          {title}
        </h3>
        {open ? (
          <ChevronUp size={16} className="text-white/40" />
        ) : (
          <ChevronDown size={16} className="text-white/40" />
        )}
      </button>
      {open && <div className="px-6 pb-5">{children}</div>}
    </div>
  );
}

/* ══════════════════════════════════════════════════
   Kiểu dữ liệu ghế nhóm theo hạng vé
   ══════════════════════════════════════════════════ */
type SeatGroup = {
  tierName: string;
  tierId: string;
  seats: string[];
  unitPrice: number;
  subtotal: number;
};

/* ================================================================
   MAIN COMPONENT
   ================================================================ */
export default function BookingDetails() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const event = useMemo(() => getEvent(eventId), [eventId]);

  // Dữ liệu được truyền từ trang Booking
  const selectedSeats: string[] = location.state?.selectedSeats || [];
  const seatToTierMap: Record<string, string> =
    location.state?.seatToTierMap || {};

  // Form state (cột phải) – cập nhật real-time sang cột trái
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [idDocument, setIdDocument] = useState("");

  // Countdown giữ vé 10 phút
  const { m, s, expired } = useCountdown(600);

  // Tự động quay lại booking khi hết hạn
  useEffect(() => {
    if (expired && eventId) {
      navigate(`/events/${eventId}/booking`);
    }
  }, [expired, eventId, navigate]);

  // Nhóm ghế theo hạng vé để hiển thị bảng khu vực & ghế ngồi
  const seatGroups: SeatGroup[] = useMemo(() => {
    if (!event) return [];

    const grouped: Record<string, string[]> = {};
    selectedSeats.forEach((seatId) => {
      const tierId = seatToTierMap[seatId] || event.ticketTiers[0]?.id || "";
      if (!grouped[tierId]) grouped[tierId] = [];
      grouped[tierId].push(seatId);
    });

    return Object.entries(grouped).map(([tierId, seats]) => {
      const tier = event.ticketTiers.find((t) => t.id === tierId);
      return {
        tierId,
        tierName: tier?.name || tierId,
        seats,
        unitPrice: tier?.price || event.price,
        subtotal: (tier?.price || event.price) * seats.length,
      };
    });
  }, [event, selectedSeats, seatToTierMap]);

  const totalAmount = useMemo(
    () => seatGroups.reduce((sum, g) => sum + g.subtotal, 0),
    [seatGroups],
  );

  if (!event)
    return <div className="p-10 text-white">{t("event.notFound")}</div>;

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-[#0a0a0a] text-white font-sans overflow-hidden">
      {/* ╔═══════════════════════════════╗
         ║       TOP HEADER BAR          ║
         ╚═══════════════════════════════╝ */}
      <header className="relative shrink-0 flex items-center justify-between px-4 md:px-8 py-3 bg-[#111] border-b border-white/5">
        {/* Logo / Back */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/events/${event.id}/booking`)}
            className="flex shrink-0 items-center gap-2 text-(--accent) hover:text-(--accent)/80 font-semibold transition-colors text-sm"
          >
            <ArrowLeft size={18} />
            <span className="hidden md:inline">{t("common.back")}</span>
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

        {/* Step Indicator (chỉ hiện trên desktop) */}
        <div className="hidden md:block">
          <StepIndicator current={1} />
        </div>

        {/* Countdown Timer */}
        <div className="flex shrink-0 items-center gap-1 md:gap-2 text-xs md:text-sm">
          <Clock size={14} className={expired ? "text-red-400" : "text-(--accent)"} />
          <span className="hidden md:inline text-white/50 text-xs">
            {t("payment.holdTime")}
          </span>
          <div
            className={`font-mono font-bold tracking-widest ${expired ? "text-red-400 animate-pulse" : "text-(--accent)"}`}
          >
            {String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
          </div>
        </div>
      </header>

      {/* Marquee */}
      <EventMarquee
        text={`${event.title}  ·  ${formatDateTime(event.date)}  ·  ${event.venue}`}
      />

      {/* ╔═══════════════════════════════╗
         ║      MAIN TWO-COLUMN BODY     ║
         ╚═══════════════════════════════╝ */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-6xl mx-auto w-full p-4 md:p-8 lg:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ────────────────────────────────────
               CỘT TRÁI – Card thông tin tổng hợp
               ──────────────────────────────────── */}
            <div className="space-y-6">
              {/* Event info card */}
              <Card className="bg-[#1a1a1a] border-white/5 border-1 overflow-hidden shadow-none">
                {/* Banner */}
                <div className="relative w-full aspect-[16/8] bg-black overflow-hidden">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-transparent" />
                </div>

                {/* Title + meta */}
                <div className="px-6 pt-3 pb-4 border-b border-white/5">
                  <h2 className="text-base md:text-lg font-bold leading-snug uppercase tracking-wide">
                    {event.title}
                  </h2>
                  <div className="mt-3 space-y-2 text-sm text-white/60">
                    <div className="flex items-center gap-2">
                      <CalendarDays
                        size={14}
                        className="shrink-0 text-white/40"
                      />
                      <span>{formatDateTime(event.date)}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin
                        size={14}
                        className="shrink-0 text-(--accent) mt-0.5"
                      />
                      <span className="leading-tight">{event.venue}</span>
                    </div>
                  </div>
                </div>

                {/* Thông tin nhận vé – live binding từ form cột phải */}
                <Section title={t("payment.recipientInfo")}>
                  <div className="space-y-2.5 text-sm">
                    <div className="flex gap-2">
                      <span className="text-white/40 w-28 shrink-0">
                        {t("payment.name")}:
                      </span>
                      <span
                        className={`font-medium ${fullName ? "text-white/90" : "text-white/20 italic"}`}
                      >
                        {fullName || t("payment.notYetEntered")}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-white/40 w-28 shrink-0">
                        Email:
                      </span>
                      <span
                        className={`font-medium ${email ? "text-white/90" : "text-white/20 italic"}`}
                      >
                        {email || t("payment.notYetEntered")}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-white/40 w-28 shrink-0">
                        {t("payment.phone")}:
                      </span>
                      <span
                        className={`font-medium ${phone ? "text-white/90" : "text-white/20 italic"}`}
                      >
                        {phone || t("payment.notYetEntered")}
                      </span>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-white/30 leading-relaxed">
                    {t("payment.deliveryNote")}
                  </p>
                </Section>

                {/* Khu vực và ghế ngồi – dữ liệu từ trang Booking */}
                <Section title={t("payment.seatArea")}>
                  {seatGroups.length > 0 ? (
                    <div className="space-y-3">
                      {/* Table header */}
                      <div className="flex items-center text-xs text-white/40 font-semibold uppercase tracking-wider pb-2 border-b border-white/5">
                        <span className="flex-1">
                          {t("payment.ticketType")}
                        </span>
                        <span className="w-20 text-center">
                          {t("payment.quantity")}
                        </span>
                        <span className="w-32 text-right">
                          {t("payment.price")}
                        </span>
                      </div>
                      {/* Rows per tier */}
                      {seatGroups.map((group) => (
                        <div key={group.tierId} className="space-y-1.5">
                          <div className="flex items-center text-sm">
                            <span className="flex-1 text-white/80 font-medium">
                              {group.tierName}
                            </span>
                            <span className="w-20 text-center text-white/60">
                              ×{group.seats.length}
                            </span>
                            <span className="w-32 text-right font-bold text-(--accent)">
                              {formatPrice(group.subtotal)}
                            </span>
                          </div>
                          {/* Seat labels */}
                          <div className="flex flex-wrap gap-1.5 pl-1">
                            {group.seats.map((seat) => (
                              <span
                                key={seat}
                                className="text-[10px] bg-white/5 text-white/50 px-2 py-0.5 rounded font-mono"
                              >
                                {seat}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                      {/* Total */}
                      <div className="flex items-center pt-3 border-t border-white/5 mt-2">
                        <span className="flex-1 text-sm font-semibold text-white/70">
                          {t("payment.total")}
                        </span>
                        <span className="text-lg font-extrabold text-(--accent)">
                          {formatPrice(totalAmount)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-white/40">
                      {t("payment.noSeatsSelected")}
                    </p>
                  )}
                </Section>
              </Card>
            </div>

            {/* ────────────────────────────────────
               CỘT PHẢI – Form nhập thông tin
               ──────────────────────────────────── */}
            <div className="space-y-6">
              {/* Thông tin người đại diện nhận vé */}
              <Card className="bg-[#1a1a1a] border-white/5 border-1 p-6 shadow-none">
                <Form
                  className="space-y-5 w-full"
                  validationBehavior="aria"
                >
                  <h3 className="text-sm font-bold text-white/90 uppercase tracking-wider">
                    {t("payment.representativeInfo")}
                  </h3>

                  {/* Họ và Tên */}
                  <TextField
                    isRequired
                    className="w-full"
                    name="fullName"
                    value={fullName}
                    onChange={setFullName}
                    validate={(value) => {
                      if (!value || value.trim().length < 2) return t("payment.validation.fullNameMin");
                      return null;
                    }}
                  >
                    <Label>{t("payment.fullName")}</Label>
                    <Input className="border border-white/10" placeholder={t("payment.fullNamePlaceholder")} />
                    <FieldError />
                  </TextField>

                  {/* Email */}
                  <TextField
                    isRequired
                    className="w-full"
                    name="email"
                    type="email"
                    value={email}
                    onChange={setEmail}
                    validate={(value) => {
                      if (!value) return t("payment.validation.emailRequired");
                      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return t("payment.validation.emailInvalid");
                      return null;
                    }}
                  >
                    <Label>Email</Label>
                    <Input className="border border-white/10" placeholder="email@example.com" />
                    <FieldError />
                  </TextField>

                  {/* Số điện thoại */}
                  <TextField
                    isRequired
                    className="w-full"
                    name="phone"
                    type="tel"
                    value={phone}
                    onChange={setPhone}
                    validate={(value) => {
                      if (!value) return t("payment.validation.phoneRequired");
                      if (!/^[0-9]{9,11}$/.test(value)) return t("payment.validation.phoneInvalid");
                      return null;
                    }}
                  >
                    <Label>{t("payment.phoneNumber")}</Label>
                    <Input className="border border-white/10" placeholder="0123456789" />
                    <FieldError />
                  </TextField>

                  {/* Giấy tờ tùy thân */}
                  <TextField
                    className="w-full"
                    name="idDocument"
                    value={idDocument}
                    onChange={setIdDocument}
                  >
                    <Label>{t("payment.idDocument")}</Label>
                    <Input className="border border-white/10" placeholder={t("payment.idPlaceholder")} />
                  </TextField>
                </Form>
              </Card>

              {/* Hình thức nhận vé */}
              <Card className="bg-[#1a1a1a] border-white/5 border-1 p-6 space-y-4 shadow-none">
                <h3 className="text-sm font-bold text-white/90 uppercase tracking-wider">
                  {t("payment.deliveryMethod")}
                </h3>

                <label className="flex items-start gap-3 p-4 rounded-lg border-2 border-(--accent) bg-(--accent)/5 cursor-pointer transition-all">
                  <div className="w-5 h-5 rounded-full border-2 border-(--accent) flex items-center justify-center mt-0.5 shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-(--accent)" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white/90">
                      {t("payment.eTicketOption")}
                      <span className="text-red-400 ml-1">*</span>
                    </p>
                    <p className="text-xs text-white/40 mt-1 leading-relaxed">
                      {t("payment.eTicketDescription")}
                    </p>
                  </div>
                </label>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* ╔═══════════════════════════════╗
         ║       FIXED BOTTOM BAR        ║
         ╚═══════════════════════════════╝ */}
      <footer className="shrink-0 w-full bg-[#111] border-t border-white/5">
        <div className="max-w-6xl mx-auto w-full flex items-center justify-between px-4 md:px-8 py-3">
          <p className="text-xs text-white/30 hidden md:block max-w-md">
            {t("payment.bottomNote")}
          </p>
          <div className="flex items-center gap-3 ml-auto">
            <Button
              className="px-6 py-2.5 text-sm font-semibold bg-transparent border border-white/15 text-white/70 hover:bg-white/5 hover:text-white rounded-lg transition-all"
              onClick={() => navigate(`/events/${event.id}/booking`)}
            >
              {t("payment.reselectTickets")}
            </Button>
            <Button
              className="px-8 py-2.5 text-sm font-bold bg-(--accent) text-black hover:bg-(--accent)/90 rounded-lg shadow-[0_0_20px_oklch(83.77%_0.1655_81.92_/_0.3)] transition-all"
              onClick={() => {
                navigate(`/events/${event.id}/payment`, {
                  state: {
                    selectedSeats,
                    seatToTierMap,
                    fullName,
                    email,
                    phone,
                    idDocument,
                  },
                });
              }}
            >
              {t("payment.continue")}
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
