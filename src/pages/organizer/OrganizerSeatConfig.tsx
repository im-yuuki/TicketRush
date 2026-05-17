import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Check, Minus, Plus, Save } from "lucide-react";
import { Button } from "@heroui/react";
import { organizerEventsService, getStoredOrganizerEventPreviewId, getServerIds, createSeatZonesOnServer } from "../../api/organizerEventsService";
import { getSeatConfig, saveSeatConfig } from "../../utils/organizer/organizerSeatLayoutStorage";
import type { ShowTime, TicketTypeData } from "../../types/organizerCreate";
import type { TierDimensions } from "../../types/seat";

const TIER_COLORS = ["#ef4444", "#fcd34d", "#a3e635", "#86efac", "#5eead4", "#fca5a5", "#93c5fd", "#c084fc", "#fb923c"];

function formatPrice(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

function getTierId(showTime: ShowTime, ticket: TicketTypeData) {
  return `${showTime.id}-${ticket.id}`;
}

function buildTierDimensions(showTime: ShowTime): TierDimensions[] {
  return showTime.tickets.map((ticket) => ({
    tierId: getTierId(showTime, ticket),
    name: ticket.name,
    rows: 5,
    cols: 10,
  }));
}

export default function OrganizerSeatConfig() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const event = useMemo(
    () => (eventId ? organizerEventsService.findById(eventId) : undefined),
    [eventId],
  );

  const showTimes = event?.showTimes ?? [];
  const showTime = showTimes[0] ?? null;

  const storageKey = event ? getStoredOrganizerEventPreviewId(event) : eventId ?? "";

  const [tierDims, setTierDims] = useState<TierDimensions[]>([]);
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const prevConfigKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!storageKey || !showTime) return;
    if (prevConfigKeyRef.current === storageKey) return;
    prevConfigKeyRef.current = storageKey;

    const existing = getSeatConfig(storageKey);
    if (existing && existing.length > 0) {
      setTierDims(existing); // eslint-disable-line react-hooks/set-state-in-effect
    } else {
      setTierDims(buildTierDimensions(showTime));
    }
  }, [storageKey, showTime]);

  const tiers = useMemo(() => {
    if (!showTime) return [];
    return showTime.tickets.map((ticket, idx) => ({
      id: getTierId(showTime, ticket),
      name: ticket.name,
      price: ticket.isFree ? 0 : Number(String(ticket.price).replace(/[^\d]/g, "")) || 0,
      color: TIER_COLORS[idx % TIER_COLORS.length],
    }));
  }, [showTime]);

  const updateDim = useCallback((tierId: string, field: "rows" | "cols", delta: number) => {
    setTierDims((prev) =>
      prev.map((td) => {
        if (td.tierId !== tierId) return td;
        const current = field === "rows" ? td.rows : td.cols;
        const next = Math.max(1, Math.min(field === "rows" ? 26 : 40, current + delta));
        return field === "rows" ? { ...td, rows: next } : { ...td, cols: next };
      }),
    );
  }, []);

  const totalSeats = useMemo(
    () => tierDims.reduce((sum, td) => sum + td.rows * td.cols, 0),
    [tierDims],
  );

  const handleSave = useCallback(async () => {
    if (!storageKey || isSaving) return;
    setIsSaving(true);

    try {
      // Save locally first
      saveSeatConfig(storageKey, tierDims);

      // Send to server
      const serverIds = getServerIds(storageKey);
      const numericEventId = serverIds?.eventId ?? parseInt(eventId ?? "0", 10);

      if (numericEventId > 0) {
        const tiersForServer = tierDims.map((dim) => {
          const tier = tiers.find((t) => t.id === dim.tierId);
          return {
            name: dim.name,
            rows: dim.rows,
            cols: dim.cols,
            price: tier?.price,
          };
        });

        const result = await createSeatZonesOnServer(numericEventId, storageKey, tiersForServer);

        if (!result.success) {
          window.alert(`Không thể lưu cấu hình ghế lên server: ${result.message ?? "Lỗi không xác định"}`);
        }
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setIsSaving(false);
    }
  }, [storageKey, tierDims, tiers, eventId, isSaving]);

  if (!event) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0a0a0a] text-white">
        <p>Không tìm thấy sự kiện.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[100dvh] w-full bg-[#0a0a0a] text-white font-sans">
      {/* Header */}
      <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/5 shrink-0">
        <button
          onClick={() => navigate("/organizer/events")}
          className="flex items-center gap-2 text-(--accent) hover:text-(--accent)/80 font-medium transition-colors shrink-0"
        >
          <ArrowLeft size={20} />
          <span className="hidden md:inline">{t("common.back", "Trở về")}</span>
        </button>
        <h1 className="text-lg font-bold tracking-wide text-(--accent)">
          {t("organizer.seatConfig.title", "Cấu hình sơ đồ ghế")}
        </h1>
        <div className="flex items-center gap-3">
          {totalSeats > 0 && (
            <div className="hidden md:flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium">
              <span className="text-(--accent) font-bold tabular-nums">{totalSeats}</span>
              <span className="text-gray-400">{t("organizer.seatConfig.seats", "ghế")}</span>
            </div>
          )}
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              size="sm"
              className={`font-bold transition-all ${
                saved ? "bg-green-500 text-white" : "bg-(--accent) text-black hover:bg-(--accent)/90"
              }`}
              onClick={handleSave}
              isDisabled={tierDims.length === 0 || isSaving}
            >
              <AnimatePresence mode="wait">
                {saved ? (
                  <motion.span key="saved" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="flex items-center gap-1">
                    <Check className="size-4" />
                    {t("common.saved", "Đã lưu")}
                  </motion.span>
                ) : isSaving ? (
                  <motion.span key="saving" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="flex items-center gap-1">
                    {t("common.saving", "Đang lưu...")}
                  </motion.span>
                ) : (
                  <motion.span key="save" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="flex items-center gap-1">
                    <Save className="size-4" />
                    {t("common.save", "Lưu")}
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar max-w-2xl mx-auto w-full">
        {/* Showtime info */}
        {showTime && (
          <div className="mb-6">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
              {t("organizer.seatConfig.showtime", "Suất diễn")}
            </label>
            <p className="text-sm font-medium text-white">{showTime.name}</p>
          </div>
        )}

        {/* Tier grid config */}
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
          {t("organizer.seatConfig.tiers", "Cấu hình kích thước ghế mỗi hạng vé")}
        </h3>
        {tiers.length === 0 ? (
          <p className="text-sm text-gray-500">
            {t("organizer.seatConfig.noTiers", "Chưa có hạng vé. Hãy tạo vé trước.")}
          </p>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}
            className="space-y-4"
          >
            {tiers.map((tier) => {
              const dim = tierDims.find((d) => d.tierId === tier.id);
              const rows = dim?.rows ?? 5;
              const cols = dim?.cols ?? 10;
              const seatCount = rows * cols;

              return (
                <motion.div
                  key={tier.id}
                  variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
                  className="rounded-lg border border-white/10 bg-[#1a1a1a] p-4"
                >
                  {/* Tier header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="size-6 shrink-0 rounded" style={{ backgroundColor: tier.color }} />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-white">{tier.name}</p>
                      <p className="text-xs text-gray-400">{formatPrice(tier.price)}</p>
                    </div>
                    <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-bold text-(--accent) tabular-nums">
                        {seatCount} {t("organizer.seatConfig.seats", "ghế")}
                    </span>
                  </div>

                  {/* Row/Col controls */}
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-[0.65rem] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                        {t("organizer.seatConfig.rowsLabel", "Số hàng (Y)")}
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateDim(tier.id, "rows", -1)}
                          className="size-8 rounded-md bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <span className="flex-1 text-center text-lg font-bold tabular-nums">{rows}</span>
                        <button
                          type="button"
                          onClick={() => updateDim(tier.id, "rows", 1)}
                          className="size-8 rounded-md bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex-1">
                      <label className="block text-[0.65rem] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                        {t("organizer.seatConfig.colsLabel", "Số ghế/hàng (X)")}
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateDim(tier.id, "cols", -1)}
                          className="size-8 rounded-md bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <span className="flex-1 text-center text-lg font-bold tabular-nums">{cols}</span>
                        <button
                          type="button"
                          onClick={() => updateDim(tier.id, "cols", 1)}
                          className="size-8 rounded-md bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Row labels preview */}
                  <div className="mt-2 text-[0.6rem] text-gray-600">
                    {t("organizer.seatConfig.rowLabels", "Hàng")}: {Array.from({ length: Math.min(rows, 8) }, (_, i) => String.fromCharCode(65 + i)).join(", ")}
                    {rows > 8 ? ` ... ${String.fromCharCode(65 + rows - 1)}` : ""}
                    {" · "}{t("organizer.seatConfig.perRow", "Mỗi hàng {{cols}} ghế", { cols })}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 md:p-6 bg-[#262626] border-t border-white/5 shrink-0">
        <p className="text-xs text-gray-500 leading-relaxed text-center">
          {t("organizer.seatConfig.help", "Nhập số hàng (Y) và số ghế mỗi hàng (X) cho mỗi hạng vé.")}
        </p>
      </div>
    </div>
  );
}
