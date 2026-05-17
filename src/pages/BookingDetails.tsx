import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Clock,
} from "lucide-react";
import { Card, Button, TextField, Label, Input, FieldError, Form } from "@heroui/react";
import { useEventData } from "../hooks/useEventData";
import { Logo } from "../components/Branding";
import { StepIndicator } from "../components/booking/StepIndicator";
import { EventMarquee } from "../components/booking/EventMarquee";
import { Section } from "../components/booking/Section";
import { formatPrice, formatDateTime } from "../utils/format";
import { useCountdown } from "../utils/useCountdown";
import { seatIdToLabel } from "../utils/seatLayoutBuilder";
import { useBooking } from "../contexts/BookingContext";

/* ================================================================
   MAIN COMPONENT
   ================================================================ */
export default function BookingDetails() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { booking, setCustomerInfo } = useBooking();

  const { event, loading: eventLoading } = useEventData(eventId);

  // Read from context instead of location.state
  const selectedSeats = booking?.selectedSeats || [];
  const tierName = booking?.selectedTierName || "";
  const tierPrice = booking?.selectedTierPrice || 0;

  // Form state – initialize from context if returning to this page
  const [fullName, setFullName] = useState(booking?.fullName || "");
  const [email, setEmail] = useState(booking?.email || "");
  const [phone, setPhone] = useState(booking?.phone || "");
  const [idDocument, setIdDocument] = useState(booking?.idDocument || "");

  // Validation – only show errors after first submit attempt
  const [submitted, setSubmitted] = useState(false);
  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!fullName || fullName.trim().length < 2) e.fullName = t("payment.validation.fullNameMin");
    if (!email) e.email = t("payment.validation.emailRequired");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = t("payment.validation.emailInvalid");
    if (!phone) e.phone = t("payment.validation.phoneRequired");
    else if (!/^[0-9]{9,11}$/.test(phone)) e.phone = t("payment.validation.phoneInvalid");
    return e;
  }, [fullName, email, phone, t]);
  const isValid = Object.keys(errors).length === 0;

  // Countdown – shared across all pages from booking start
  const { m, s, expired } = useCountdown({ expiresAt: booking?.expiresAt });

  // Tự động quay lại booking khi hết hạn
  useEffect(() => {
    if (!expired || !eventId || !booking?.expiresAt) return;
    navigate(`/events/${eventId}/booking`);
  }, [expired, eventId, navigate, booking?.expiresAt]);

  // Single tier — direct calculation
  const totalAmount = selectedSeats.length * tierPrice;

  if (eventLoading)
    return <div className="flex items-center justify-center h-[100dvh] bg-[#0a0a0a] text-white"><p className="text-sm text-gray-400">{t("common.loading", "Đang tải...")}</p></div>;

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
                  {selectedSeats.length > 0 ? (
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
                      {/* Single tier row */}
                      <div className="space-y-1.5">
                        <div className="flex items-center text-sm">
                          <span className="flex-1 text-white/80 font-medium">
                            {tierName}
                          </span>
                          <span className="w-20 text-center text-white/60">
                            ×{selectedSeats.length}
                          </span>
                          <span className="w-32 text-right font-bold text-(--accent)">
                            {formatPrice(totalAmount)}
                          </span>
                        </div>
                        {/* Seat labels */}
                        <div className="flex flex-wrap gap-1.5 pl-1">
                          {selectedSeats.map((seat) => (
                            <span
                              key={seat}
                              className="text-[10px] bg-white/5 text-white/50 px-2 py-0.5 rounded font-mono"
                            >
                              {seatIdToLabel(seat)}
                            </span>
                          ))}
                        </div>
                      </div>
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
                  <div>
                    <TextField
                      isRequired
                      className="w-full"
                      name="fullName"
                      value={fullName}
                      onChange={setFullName}
                      isInvalid={submitted && !!errors.fullName}
                    >
                      <Label>{t("payment.fullName")}</Label>
                      <Input className="border border-white/10" placeholder={t("payment.fullNamePlaceholder")} />
                      <FieldError />
                    </TextField>
                    {submitted && errors.fullName && (
                      <p className="text-xs text-red-400 mt-1">{errors.fullName}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <TextField
                      isRequired
                      className="w-full"
                      name="email"
                      type="email"
                      value={email}
                      onChange={setEmail}
                      isInvalid={submitted && !!errors.email}
                    >
                      <Label>Email</Label>
                      <Input className="border border-white/10" placeholder="email@example.com" />
                      <FieldError />
                    </TextField>
                    {submitted && errors.email && (
                      <p className="text-xs text-red-400 mt-1">{errors.email}</p>
                    )}
                  </div>

                  {/* Số điện thoại */}
                  <div>
                    <TextField
                      isRequired
                      className="w-full"
                      name="phone"
                      type="tel"
                      value={phone}
                      onChange={setPhone}
                      isInvalid={submitted && !!errors.phone}
                    >
                      <Label>{t("payment.phoneNumber")}</Label>
                      <Input className="border border-white/10" placeholder="0123456789" />
                      <FieldError />
                    </TextField>
                    {submitted && errors.phone && (
                      <p className="text-xs text-red-400 mt-1">{errors.phone}</p>
                    )}
                  </div>

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
                setSubmitted(true);
                if (!isValid) return;
                // Save customer info to context before navigating
                setCustomerInfo({ fullName, email, phone, idDocument });
                navigate(`/events/${event.id}/payment`);
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
