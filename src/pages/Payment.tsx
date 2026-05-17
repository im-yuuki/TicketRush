import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Clock,
  Landmark,
  CreditCard,
} from "lucide-react";
import { Button, Input, Card } from "@heroui/react";
import { useEventData } from "../hooks/useEventData";
import { Logo } from "../components/Branding";
import { StepIndicator } from "../components/booking/StepIndicator";
import { EventMarquee } from "../components/booking/EventMarquee";
import { Section } from "../components/booking/Section";
import { formatPrice, formatDateTime } from "../utils/format";
import { useCountdown } from "../utils/useCountdown";
import { seatIdToLabel } from "../utils/seatLayoutBuilder";
import { useBooking } from "../contexts/BookingContext";

type PaymentMethod = "bank_transfer" | "credit_card";

function PaymentMethodOption({
  selected,
  icon,
  label,
  description,
  onPress,
}: {
  selected: boolean;
  icon: React.ReactNode;
  label: string;
  description: string;
  onPress: () => void;
}) {
  return (
    <motion.button
      type="button"
      onPointerDown={onPress}
      onClick={onPress}
      whileTap={{ scale: 0.985 }}
      whileHover={{ y: -1 }}
      transition={{ type: "spring", stiffness: 700, damping: 32, mass: 0.35 }}
      className={`w-full border rounded-xl px-4 py-3 text-left select-none touch-manipulation will-change-transform transition-colors duration-150 ease-out ${
        selected
          ? "border-accent bg-surface-secondary ring-1 ring-(--accent)/30"
          : "border-border bg-surface hover:bg-surface-secondary"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${
              selected
                ? "bg-accent-soft text-accent"
                : "bg-surface-tertiary text-muted"
            }`}
          >
            {icon}
          </div>
          <div className="min-w-0 text-left">
            <p className={`text-sm font-semibold ${selected ? "text-(--foreground)" : "text-surface-foreground"}`}>
              {label}
            </p>
            <p className={`text-sm ${selected ? "text-(--foreground)/75" : "text-muted"}`}>
              {description}
            </p>
          </div>
        </div>

        <div
          className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center ${
            selected ? "border-accent" : "border-border bg-surface-tertiary"
          }`}
        >
          <AnimatePresence initial={false} mode="wait">
            {selected && (
              <motion.div
                key="payment-method-dot"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 900, damping: 28 }}
                className="w-2.5 h-2.5 rounded-full bg-accent"
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.button>
  );
}

/* ================================================================
   MAIN COMPONENT
   ================================================================ */
export default function Payment() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { booking, setPaymentMethod: savePaymentMethod, setTotalAmount, releaseAndClearBooking } = useBooking();

  const { event, loading: eventLoading } = useEventData(eventId);

  // Read from context instead of location.state
  const selectedSeats = booking?.selectedSeats || [];
  const tierName = booking?.selectedTierName || "";
  const tierPrice = booking?.selectedTierPrice || 0;
  const fullName = booking?.fullName || "";
  const email = booking?.email || "";
  const phone = booking?.phone || "";
  const idDocument = booking?.idDocument || "";

  const [paymentMethod, setPaymentMethodLocal] = useState<PaymentMethod>(booking?.paymentMethod || "bank_transfer");
  const [discountCode, setDiscountCode] = useState("");

  // Exit booking flow — release hold if any, then navigate home
  const handleExitToHome = useCallback(() => {
    releaseAndClearBooking();
    navigate("/");
  }, [releaseAndClearBooking, navigate]);

  // Countdown – shared across all pages from booking start
  const { m, s, expired } = useCountdown({ expiresAt: booking?.expiresAt });

  // Tự động quay lại booking khi hết hạn
  useEffect(() => {
    if (!expired || !eventId || !booking?.expiresAt) return;
    navigate(`/events/${eventId}/booking`);
  }, [expired, eventId, navigate, booking?.expiresAt]);

  // Single tier — direct calculation
  const totalAmount = selectedSeats.length * tierPrice;

  const handlePaymentSubmit = () => {
    // Save payment method and total to context
    savePaymentMethod(paymentMethod);
    setTotalAmount(totalAmount);

    const holdId = booking?.sessionId;
    if (paymentMethod === "bank_transfer" && holdId) {
      navigate(`/checkout/${holdId}`);
    } else if (!holdId) {
      console.error("No hold session found");
    } else {
      // TODO: Xử lý credit card payment
      console.log("Credit card payment not yet implemented");
    }
  };

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
            onClick={() => navigate(`/events/${event.id}/booking-details`)}
            className="flex shrink-0 items-center gap-2 text-(--accent) hover:text-(--accent)/80 font-semibold transition-colors text-sm"
          >
            <ArrowLeft size={18} />
            <span className="hidden md:inline">{t("common.back")}</span>
          </button>
          <div className="hidden md:block h-5 w-px bg-white/15" />
          <Link to="/" onClick={handleExitToHome}>
            <Logo className="hidden md:flex text-2xl md:text-3xl" />
          </Link>
        </div>

        <Link
          to="/"
          onClick={handleExitToHome}
          className="pointer-events-auto absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-center md:hidden"
        >
          <Logo className="text-2xl" />
        </Link>

        {/* Step Indicator (chỉ hiện trên desktop) */}
        <div className="hidden md:block">
          <StepIndicator current={2} />
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
        text={`${event.title.toUpperCase()} \u2022 ${formatDateTime(event.date)} \u2022 ${event.venue}`}
      />

      {/* ╔═══════════════════════════════╗
         ║      MAIN TWO-COLUMN BODY     ║
         ╚═══════════════════════════════╝ */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-6xl mx-auto w-full p-4 md:p-8 lg:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* ────────────────────────────────────
               CỘT TRÁI – Thông tin sự kiện và nhận vé
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

                {/* Thông tin nhận vé */}
                <Section title={t("payment.recipientInfo")}>
                  <div className="space-y-2.5 text-sm">
                    <div className="flex gap-2">
                      <span className="text-white/40 w-28 shrink-0">
                        {t("payment.name")}:
                      </span>
                      <span className="font-medium whitespace-normal break-words text-white/90">
                        {fullName || t("payment.notYetEntered")}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-white/40 w-28 shrink-0">
                        Email:
                      </span>
                      <span className="font-medium whitespace-normal break-words text-white/90">
                        {email || t("payment.notYetEntered")}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-white/40 w-28 shrink-0">
                        {t("payment.phone")}:
                      </span>
                      <span className="font-medium whitespace-normal break-words text-white/90">
                        {phone || t("payment.notYetEntered")}
                      </span>
                    </div>
                    {idDocument && (
                      <div className="flex gap-2">
                        <span className="text-white/40 w-28 shrink-0">
                          {t("payment.idDocument")}:
                        </span>
                        <span className="font-medium whitespace-normal break-words text-white/90">
                          {idDocument}
                        </span>
                      </div>
                    )}
                  </div>
                </Section>

                {/* Khu vực và ghế ngồi */}
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
                    <div className="text-white/40 text-sm italic py-2">
                      {t("payment.noSeatsSelected")}
                    </div>
                  )}
                </Section>
              </Card>
            </div>

            {/* ────────────────────────────────────
               CỘT PHẢI – Chọn hình thức thanh toán & Giảm giá
               ──────────────────────────────────── */}
            <div className="space-y-6">
              
              {/* Chọn hình thức thanh toán */}
              <Card className="bg-surface border-border border p-6 space-y-5">
                <h3 className="text-sm font-bold text-surface-foreground uppercase tracking-wider">
                  {t("payment.paymentMethod")}
                </h3>

                <div className="space-y-3">
                  <PaymentMethodOption
                    selected={paymentMethod === "bank_transfer"}
                    icon={<Landmark size={18} />}
                    label={t("payment.bankTransfer")}
                    description={t("payment.bankTransferDesc")}
                    onPress={() => setPaymentMethodLocal("bank_transfer")}
                  />

                  <PaymentMethodOption
                    selected={paymentMethod === "credit_card"}
                    icon={<CreditCard size={18} />}
                    label={t("payment.creditCard")}
                    description={t("payment.creditCardDesc")}
                    onPress={() => setPaymentMethodLocal("credit_card")}
                  />
                </div>
              </Card>

              {/* Mã giảm giá */}
              <Card className="bg-surface border-border border p-6 space-y-5">
                <h3 className="text-sm font-bold text-surface-foreground uppercase tracking-wider">
                  {t("payment.discountCode")}
                </h3>
                <div className="flex gap-2">
                  <Input 
                    placeholder={t("payment.discountPlaceholder")}
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    className="border border-white/10 flex-1"
                  />
                  <Button className="bg-surface-tertiary text-surface-foreground font-medium hover:bg-surface-secondary">
                    {t("payment.apply")}
                  </Button>
                </div>
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
            {t("payment.termsAgreement")}
          </p>
          <div className="flex items-center gap-3 ml-auto">
            <Button
              className="px-6 py-2.5 text-sm font-semibold bg-transparent border border-white/15 text-white/70 hover:bg-white/5 hover:text-white rounded-lg transition-all"
              onClick={() => navigate(`/events/${event.id}/booking-details`)}
            >
              {t("common.back")}
            </Button>
              <Button 
                onClick={handlePaymentSubmit}
                className="px-8 py-2.5 text-sm font-bold bg-(--accent) text-black hover:bg-(--accent)/90 rounded-lg shadow-[0_0_20px_oklch(83.77%_0.1655_81.92_/_0.3)] transition-all"
              >
              {t("payment.payNow")}
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
