import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Clock,
} from "lucide-react";
import { Button, Card } from "@heroui/react";
import { getEvent } from "../data/events";
import { Logo } from "../components/Branding";
import { StepIndicator } from "../components/booking/StepIndicator";
import { EventMarquee } from "../components/booking/EventMarquee";
import { Section } from "../components/booking/Section";
import { formatPrice, formatDateTime } from "../utils/format";
import { useCountdown } from "../utils/useCountdown";
import { computeSeatGroups, computeTotalAmount } from "../utils/seatGroups";
import { useBooking } from "../contexts/BookingContext";

/* ================================================================
   MAIN COMPONENT
   ================================================================ */
export default function Checkout() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { booking, clearBooking } = useBooking();

  // Read from context instead of location.state
  const eventId = booking?.eventId || "";
  const selectedSeats = booking?.selectedSeats || [];
  const seatToTierMap = booking?.seatToTierMap || {};
  const fullName = booking?.fullName || "";
  const email = booking?.email || "";
  const phone = booking?.phone || "";
  const totalAmountFromContext = booking?.totalAmount || 0;

  const event = useMemo(() => getEvent(eventId), [eventId]);

  const [isConfirming, setIsConfirming] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);

  // Countdown – shared across all pages from booking start
  const { m, s, expired } = useCountdown({ expiresAt: booking?.expiresAt });

  useEffect(() => {
    if (!expired || !eventId || !booking?.expiresAt) return;
    navigate(`/events/${eventId}/booking`);
  }, [expired, eventId, navigate, booking?.expiresAt]);

  // Seat groups
  const seatGroups = useMemo(() => {
    if (!event) return [];
    return computeSeatGroups(selectedSeats, seatToTierMap, event.ticketTiers, event.price);
  }, [event, selectedSeats, seatToTierMap]);

  const totalAmount = useMemo(() => {
    if (typeof totalAmountFromContext === "number" && totalAmountFromContext > 0) return totalAmountFromContext;
    return computeTotalAmount(seatGroups);
  }, [seatGroups, totalAmountFromContext]);

  // Payment receiver info (from your provided data)
  const bankName = "BIDV";
  const accountNumberValue = "8883315508";
  const accountHolderName = "TRAN DUC LAM";

  // Build QR image URL with dynamic amount and sessionId
  const qrBase = "https://api.vietqr.io/image/970418-8883315508-y3dke5Y.jpg";
  const amountForQr = Math.round(totalAmount);
  const qrUrl = `${qrBase}?accountName=${encodeURIComponent(accountHolderName)}&amount=${amountForQr}&addInfo=${encodeURIComponent(
    `Thanh toan don hang ${sessionId}`,
  )}`;

  const copyToClipboard = (text: string) => {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      navigator.clipboard.writeText(text).catch(() => {});
    }
  };

  const handleConfirmPayment = async () => {
    setIsConfirming(true);
    try {
      // TODO: Call backend to confirm payment
      // await apiPost(`/bookings/${sessionId}/confirm`, {});
      console.log("Payment confirmed for session:", sessionId);

      setPaymentConfirmed(true);
      // Clear booking context after successful payment
      // clearBooking();
    } catch (err) {
      console.error("Payment confirmation failed:", err);
    } finally {
      setIsConfirming(false);
    }
  };

  if (!event)
    return <div className="p-10 text-white">{t("event.notFound")}</div>;

  if (paymentConfirmed) {
    return (
      <div className="flex flex-col items-center justify-center h-[100dvh] w-full bg-[#0a0a0a] text-white font-sans">
        <div className="text-center space-y-4 p-8">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold">{t("checkout.paymentConfirmed") || "Payment Confirmed!"}</h2>
          <p className="text-white/60 text-sm">
            {t("checkout.paymentConfirmedDesc") || "Your tickets will be sent to your email shortly."}
          </p>
          <Button
            className="mt-4 px-8 py-2.5 text-sm font-bold bg-(--accent) text-black hover:bg-(--accent)/90 rounded-lg"
            onClick={() => {
              clearBooking();
              navigate("/");
            }}
          >
            {t("common.backToHome") || "Back to Home"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-[#0a0a0a] text-white font-sans overflow-hidden">
      {/* ╔═══════════════════════════════╗
         ║       TOP HEADER BAR          ║
         ╚═══════════════════════════════╝ */}
      <header className="relative shrink-0 flex items-center justify-between px-4 md:px-8 py-3 bg-[#111] border-b border-white/5">
        {/* Logo / Back */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/events/${event.id}/payment`)}
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
                  </div>
                </Section>

                {/* Khu vực và ghế ngồi */}
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
                    <div className="text-white/40 text-sm italic py-2">
                      {t("payment.noSeatsSelected")}
                    </div>
                  )}
                </Section>
              </Card>
            </div>

            {/* ────────────────────────────────────
               CỘT PHẢI – Thông tin thanh toán (QR + Account Info)
               ──────────────────────────────────── */}
            <div className="space-y-6">
              
              {/* Payment Account Card */}
              <Card className="bg-[#1a1a1a] border-white/5 border-1 overflow-hidden shadow-none">
                {/* Title */}
                <div className="px-6 py-5 border-b border-white/5">
                  <h3 className="text-sm font-bold text-white/90 uppercase tracking-wider">
                    {t("checkout.accountInfo") || "Thông tin tài khoản"}
                  </h3>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                  {/* Total Amount */}
                  <div className="text-center space-y-1">
                    <p className="text-xs text-white/50 uppercase tracking-wider">
                      {t("checkout.totalPayment") || "Tổng số tiền cần thanh toán"}
                    </p>
                    <div className="text-3xl md:text-4xl font-bold text-(--accent)">
                      {formatPrice(totalAmount)}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                  {/* Two column: QR Code + Account Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    
                    {/* Left: QR Code */}
                    <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="w-full aspect-square rounded-lg bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                          <img
                            src={qrUrl}
                            alt="QR Code"
                            className="w-full h-full object-contain p-4 bg-white/5"
                          />
                        </div>
                      <p className="text-xs text-white/40 text-center">
                        {t("checkout.scanQrCode") || "Quét mã QR để thanh toán"}
                      </p>
                    </div>

                    {/* Right: Account Details */}
                    <div className="space-y-4">
                      {/* Info text */}
                      <p className="text-xs text-white/50 leading-relaxed">
                        {t("checkout.paymentInfoDesc") ||
                          "Bạn có thể quét mã QR hoặc chuyển khoản theo thông tin sau"}
                      </p>

                      {/* Account details section */}
                      <div className="space-y-3.5 pt-2">
                        {/* Bank */}
                        <div className="space-y-1">
                          <p className="text-xs text-white/40 uppercase tracking-wider">
                            {t("checkout.bank") || "Ngân hàng thụ hưởng"}
                          </p>
                          <p className="text-sm font-semibold text-white/90">
                            {bankName}
                          </p>
                        </div>

                        {/* Account Number */}
                        <div className="space-y-1">
                          <p className="text-xs text-white/40 uppercase tracking-wider">
                            {t("checkout.accountNumber") || "Số tài khoản"}
                          </p>
                          <div className="flex items-center gap-2 group">
                            <p className="text-sm font-mono font-semibold text-white/80 break-all">
                              {accountNumberValue}
                            </p>
                            <button
                              onClick={() => copyToClipboard(accountNumberValue)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Copy"
                            >
                              <svg
                                className="w-4 h-4 text-white/40 hover:text-white/70"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>

                        {/* Account Holder */}
                        <div className="space-y-1">
                          <p className="text-xs text-white/40 uppercase tracking-wider">
                            {t("checkout.accountHolder") || "Tên tài khoản"}
                          </p>
                          <p className="text-sm font-semibold text-white/80">
                            {accountHolderName}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                  {/* Additional note */}
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 space-y-1">
                    <p className="text-xs text-blue-300 font-medium">
                      {t("checkout.noteTitle") || "Lưu ý:"}
                    </p>
                    <p className="text-xs text-blue-200/80">
                      {t("checkout.noteContent") ||
                        "Sau khi hoàn tất thanh toán, vui lòng chờ tối đa 5 phút. Vé sẽ được cấp nhật tự động."}
                    </p>
                  </div>
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
              onClick={() => navigate(`/events/${event.id}/payment`)}
            >
              {t("common.back")}
            </Button>
            <Button
              className="px-8 py-2.5 text-sm font-bold bg-(--accent) text-black hover:bg-(--accent)/90 rounded-lg shadow-[0_0_20px_oklch(83.77%_0.1655_81.92_/_0.3)] transition-all"
              onClick={handleConfirmPayment}
              isDisabled={isConfirming}
            >
              {isConfirming ? t("checkout.confirming") || "Confirming..." : t("checkout.confirmPayment") || "Đã thanh toán"}
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
