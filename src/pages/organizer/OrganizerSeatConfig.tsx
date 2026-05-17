import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Check, ChevronDown, Save } from "lucide-react";
import { Button, Dropdown } from "@heroui/react";
import SeatMap, { type VenueLayout } from "../../components/SeatMap";
import { organizerEventsService } from "../../api/organizerEventsService";
import { getSeatLayout, saveSeatLayout } from "../../utils/organizer/organizerSeatLayoutStorage";
import type { ShowTime, TicketTypeData } from "../../types/organizerCreate";

import cinemaLayout from "../../data/layouts/cinema.json";
import concertHallLayout from "../../data/layouts/concert-hall.json";
import smallTheaterLayout from "../../data/layouts/small-theater.json";

const PRESET_LAYOUTS: Record<string, VenueLayout> = {
  cinema: cinemaLayout as VenueLayout,
  "concert-hall": concertHallLayout as VenueLayout,
  "small-theater": smallTheaterLayout as VenueLayout,
};

const PRESET_LAYOUT_LIST = Object.values(PRESET_LAYOUTS);

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

export default function OrganizerSeatConfig() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const event = useMemo(
    () => (eventId ? organizerEventsService.findById(eventId) : undefined),
    [eventId],
  );

  const showTimes = event?.showTimes ?? [];
  const [selectedShowTimeId, setSelectedShowTimeId] = useState<number | null>(
    showTimes[0]?.id ?? null,
  );
  const selectedShowTime = showTimes.find((st) => st.id === selectedShowTimeId) ?? null;

  // Seat layout state
  const [activeLayoutId, setActiveLayoutId] = useState(PRESET_LAYOUT_LIST[0].id);
  const [seatTierMap, setSeatTierMap] = useState<Record<string, string>>({});
  const [activeTierId, setActiveTierId] = useState<string | null>(null);

  // Saved notification
  const [saved, setSaved] = useState(false);

  // Drag state stored in refs (avoids stale closures in event listeners)
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const dragEndRef = useRef<{ x: number; y: number } | null>(null);
  const activeTierIdRef = useRef<string | null>(null);
  const seatTierMapRef = useRef<Record<string, string>>({});
  const prevShowTimeIdRef = useRef<number | null>(null);

  // Keep refs in sync
  activeTierIdRef.current = activeTierId;
  seatTierMapRef.current = seatTierMap;

  // Visual drag rect state (for rendering only)
  const [dragRect, setDragRect] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
  } | null>(null);

  // Helper: build default seat tier map — all seats assigned to first ticket
  const buildDefaultMap = useCallback(
    (layout: VenueLayout, tickets: TicketTypeData[], showTime: ShowTime): Record<string, string> => {
      const map: Record<string, string> = {};
      const defaultTierId = tickets[0] ? getTierId(showTime, tickets[0]) : "";
      layout.blocks.forEach((block) => {
        block.rows.forEach((row) => {
          for (let i = 1; i <= row.count; i++) {
            map[`${block.id}-${row.label}-${i}`] = defaultTierId;
          }
        });
      });
      return map;
    },
    [],
  );

  // Load saved config when showtime changes (only when showtime ID actually changes)
  useEffect(() => {
    if (!eventId || !selectedShowTimeId) return;
    if (prevShowTimeIdRef.current === selectedShowTimeId) return;

    // Auto-save current config before switching
    const prevId = prevShowTimeIdRef.current;
    if (prevId && eventId) {
      saveSeatLayout(eventId, prevId, {
        layoutId: activeLayoutId,
        seatTierMap: seatTierMapRef.current,
      });
    }

    prevShowTimeIdRef.current = selectedShowTimeId;

    const existing = getSeatLayout(eventId, selectedShowTimeId);
    if (existing) {
      setActiveLayoutId(existing.layoutId);
      setSeatTierMap(existing.seatTierMap);
    } else {
      const layout = PRESET_LAYOUT_LIST[0];
      const tickets = selectedShowTime?.tickets ?? [];
      setActiveLayoutId(layout.id);
      if (selectedShowTime) {
        setSeatTierMap(buildDefaultMap(layout, tickets, selectedShowTime));
      } else {
        setSeatTierMap({});
      }
    }
    setActiveTierId(null);
  }, [eventId, selectedShowTimeId, selectedShowTime, buildDefaultMap]);

  // Build tier info from showtime tickets
  const tiers = useMemo(() => {
    if (!selectedShowTime) return [];
    return selectedShowTime.tickets.map((ticket, idx) => ({
      id: getTierId(selectedShowTime, ticket),
      name: ticket.name,
      price: ticket.isFree ? 0 : Number(String(ticket.price).replace(/[^\d]/g, "")) || 0,
      color: TIER_COLORS[idx % TIER_COLORS.length],
    }));
  }, [selectedShowTime]);

  const tierColors = useMemo(() => {
    const map: Record<string, string> = {};
    tiers.forEach((tier) => {
      map[tier.id] = tier.color;
    });
    return map;
  }, [tiers]);

  // Build assignedSeatColors: seatId → color for visual display
  const assignedSeatColors = useMemo(() => {
    const map: Record<string, string> = {};
    for (const [seatId, tierId] of Object.entries(seatTierMap)) {
      const color = tierColors[tierId];
      if (color) map[seatId] = color;
    }
    return map;
  }, [seatTierMap, tierColors]);

  // Count assigned seats per tier
  const tierSeatCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const tierId of Object.values(seatTierMap)) {
      counts[tierId] = (counts[tierId] || 0) + 1;
    }
    return counts;
  }, [seatTierMap]);

  const totalAssignedSeats = Object.keys(seatTierMap).length;

  // Current layout object
  const currentLayout = useMemo(
    () => PRESET_LAYOUTS[activeLayoutId] ?? PRESET_LAYOUT_LIST[0],
    [activeLayoutId],
  );

  // Assign tier to seats
  const assignTier = useCallback((seatIds: string[], tierId: string) => {
    setSeatTierMap((prev) => {
      const next = { ...prev };
      for (const id of seatIds) {
        next[id] = tierId;
      }
      return next;
    });
  }, []);

  // Click handler on seats — toggle: remove if already assigned, assign if tier selected
  const handleSeatSelectionChange = useCallback(
    (selectedIds: string[]) => {
      if (selectedIds.length !== 1) return;
      const seatId = selectedIds[0];
      setSeatTierMap((prev) => {
        if (prev[seatId]) {
          const next = { ...prev };
          delete next[seatId];
          return next;
        }
        if (activeTierId) {
          return { ...prev, [seatId]: activeTierId };
        }
        return prev;
      });
    },
    [activeTierId],
  );

  // Drag-select via addEventListener in capture phase
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    function onPointerDown(e: PointerEvent) {
      if (e.button !== 0) return;
      const rect = container!.getBoundingClientRect();
      isDraggingRef.current = true;
      dragStartRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      dragEndRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }

    function onPointerMove(e: PointerEvent) {
      if (!isDraggingRef.current || !dragStartRef.current) return;
      const rect = container!.getBoundingClientRect();
      dragEndRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };

      setDragRect({
        left: Math.min(dragStartRef.current!.x, dragEndRef.current.x),
        top: Math.min(dragStartRef.current!.y, dragEndRef.current.y),
        width: Math.abs(dragEndRef.current.x - dragStartRef.current!.x),
        height: Math.abs(dragEndRef.current.y - dragStartRef.current!.y),
      });
    }

    function onPointerUp() {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;

      const start = dragStartRef.current;
      const end = dragEndRef.current;
      if (start && end) {
        const left = Math.min(start.x, end.x);
        const top = Math.min(start.y, end.y);
        const right = Math.max(start.x, end.x);
        const bottom = Math.max(start.y, end.y);

        if (right - left > 5 || bottom - top > 5) {
          const containerRect = container!.getBoundingClientRect();
          const seatButtons = container!.querySelectorAll("[data-seat-id]");
          const selectedIds: string[] = [];

          seatButtons.forEach((el) => {
            const seatRect = (el as HTMLElement).getBoundingClientRect();
            const seatLeft = seatRect.left - containerRect.left;
            const seatTop = seatRect.top - containerRect.top;
            const seatRight = seatLeft + seatRect.width;
            const seatBottom = seatTop + seatRect.height;

            if (seatLeft < right && seatRight > left && seatTop < bottom && seatBottom > top) {
              const id = el.getAttribute("data-seat-id");
              if (id) selectedIds.push(id);
            }
          });

          if (selectedIds.length > 0 && activeTierIdRef.current) {
            assignTier(selectedIds, activeTierIdRef.current);
          }
        }
      }

      dragStartRef.current = null;
      dragEndRef.current = null;
      setDragRect(null);
    }

    container.addEventListener("pointerdown", onPointerDown, true);
    window.addEventListener("pointermove", onPointerMove, true);
    window.addEventListener("pointerup", onPointerUp, true);

    return () => {
      container.removeEventListener("pointerdown", onPointerDown, true);
      window.removeEventListener("pointermove", onPointerMove, true);
      window.removeEventListener("pointerup", onPointerUp, true);
    };
  }, [assignTier]);

  // Save handler
  const handleSave = useCallback(() => {
    if (!eventId || !selectedShowTimeId) return;
    saveSeatLayout(eventId, selectedShowTimeId, {
      layoutId: activeLayoutId,
      seatTierMap,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [eventId, selectedShowTimeId, activeLayoutId, seatTierMap]);

  if (!event) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0a0a0a] text-white">
        <p>Không tìm thấy sự kiện.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-[100dvh] w-full bg-[#0a0a0a] text-white font-sans overflow-hidden">
      {/* ── Left: Seat Map ── */}
      <div className="flex flex-col flex-1 relative border-b md:border-b-0 md:border-r border-white/5 overflow-hidden">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between p-4 md:p-6 bg-gradient-to-b from-black to-transparent"
        >
          <button
            onClick={() => navigate("/organizer/events")}
            className="flex items-center gap-2 text-(--accent) hover:text-(--accent)/80 font-medium transition-colors shrink-0"
          >
            <ArrowLeft size={20} />
            <span className="hidden md:inline">{t("common.back", "Trở về")}</span>
          </button>
          <h1 className="absolute inset-x-0 text-center text-lg font-bold tracking-wide text-(--accent) pointer-events-none md:static md:inset-auto md:pointer-events-auto">
            {t("organizer.seatConfig.title", "Cấu hình sơ đồ ghế")}
          </h1>
          <div className="flex items-center gap-3">
            {/* Stats pill */}
            {totalAssignedSeats > 0 && (
              <div className="hidden md:flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium">
                <span className="text-(--accent) font-bold tabular-nums">{totalAssignedSeats}</span>
                <span className="text-gray-400">ghế đã gán</span>
              </div>
            )}
            {/* Save button */}
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                size="sm"
                className={`font-bold transition-all ${
                  saved ? "bg-green-500 text-white" : "bg-(--accent) text-black hover:bg-(--accent)/90"
                }`}
                onClick={handleSave}
                isDisabled={!selectedShowTimeId}
              >
                <AnimatePresence mode="wait">
                  {saved ? (
                    <motion.span
                      key="saved"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="flex items-center gap-1"
                    >
                      <Check className="size-4" />
                      {t("common.saved", "Đã lưu")}
                    </motion.span>
                  ) : (
                    <motion.span
                      key="save"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="flex items-center gap-1"
                    >
                      <Save className="size-4" />
                      {t("common.save", "Lưu")}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Seat Map area - drag container */}
        <div
          ref={mapContainerRef}
          className="flex-1 flex items-center justify-center pt-24 pb-10 overflow-auto relative select-none cursor-crosshair"
          style={{ touchAction: "none" }}
        >
          <motion.div
            key={activeLayoutId}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="pointer-events-none [&_button]:pointer-events-auto [&_button]:relative [&_button]:z-10"
          >
            <SeatMap
              layout={currentLayout}
              bookedSeatIds={[]}
              onSelectionChange={handleSeatSelectionChange}
              tierColors={tierColors}
              assignedSeatColors={assignedSeatColors}
              configMode
            />
          </motion.div>

          {/* Drag selection rectangle */}
          <AnimatePresence>
            {dragRect && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
                className="absolute border-2 border-dashed border-(--accent) bg-(--accent)/10 pointer-events-none z-20"
                style={{
                  left: dragRect.left,
                  top: dragRect.top,
                  width: dragRect.width,
                  height: dragRect.height,
                }}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Right: Controls ── */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="flex flex-col w-full md:w-[380px] h-auto max-h-[50vh] md:max-h-none md:h-full bg-[#2d2d2d] shrink-0 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] md:shadow-[-10px_0_30px_rgba(0,0,0,0.5)] z-20"
      >
        {/* Showtime selector */}
        <div className="p-6 border-b border-white/5">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            {t("organizer.seatConfig.selectShowtime", "Chọn suất diễn")}
          </label>
          <Dropdown>
            <Dropdown.Trigger>
              <Button
                variant="tertiary"
                className="h-10 w-full justify-between rounded-md border border-white/10 bg-[#1a1a1a] px-3 text-left text-sm font-normal text-white hover:bg-[#222]"
              >
                {selectedShowTime?.name ?? t("organizer.seatConfig.selectShowtime", "Chọn suất diễn")}
                <ChevronDown className="size-4 text-gray-400" />
              </Button>
            </Dropdown.Trigger>
            <Dropdown.Popover>
              <Dropdown.Menu
                onAction={(key) => setSelectedShowTimeId(Number(key))}
                selectionMode="single"
                selectedKeys={selectedShowTimeId ? new Set([String(selectedShowTimeId)]) : new Set()}
              >
                {showTimes.map((st) => (
                  <Dropdown.Item id={String(st.id)} key={String(st.id)} textValue={st.name}>
                    <Dropdown.ItemIndicator />
                    <span>{st.name}</span>
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>
        </div>

        {/* Layout selector */}
        <div className="p-6 border-b border-white/5">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            {t("organizer.seatConfig.selectLayout", "Chọn sơ đồ")}
          </label>
          <Dropdown>
            <Dropdown.Trigger>
              <Button
                variant="tertiary"
                className="h-10 w-full justify-between rounded-md border border-white/10 bg-[#1a1a1a] px-3 text-left text-sm font-normal text-white hover:bg-[#222]"
              >
                {currentLayout.name}
                <ChevronDown className="size-4 text-gray-400" />
              </Button>
            </Dropdown.Trigger>
            <Dropdown.Popover>
              <Dropdown.Menu
                onAction={(key) => {
                  const newLayoutId = String(key);
                  const newLayout = PRESET_LAYOUTS[newLayoutId];
                  setActiveLayoutId(newLayoutId);
                  if (newLayout && selectedShowTime) {
                    setSeatTierMap(buildDefaultMap(newLayout, selectedShowTime.tickets, selectedShowTime));
                  } else {
                    setSeatTierMap({});
                  }
                }}
                selectionMode="single"
                selectedKeys={new Set([activeLayoutId])}
              >
                {PRESET_LAYOUT_LIST.map((layout) => (
                  <Dropdown.Item id={layout.id} key={layout.id} textValue={layout.name}>
                    <Dropdown.ItemIndicator />
                    <span>{layout.name}</span>
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>
        </div>

        {/* Tier selection */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
            {t("organizer.seatConfig.selectTier", "Chọn hạng vé để gán ghế")}
          </h3>
          {tiers.length === 0 ? (
            <p className="text-sm text-gray-500">
              {t("organizer.seatConfig.noTiers", "Suất diễn này chưa có loại vé. Hãy tạo vé trước.")}
            </p>
          ) : (
            <motion.div
              key={selectedShowTimeId}
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.06 } },
              }}
              className="space-y-3"
            >
              {tiers.map((tier) => {
                const isActive = activeTierId === tier.id;
                const count = tierSeatCounts[tier.id] || 0;
                return (
                  <motion.button
                    key={tier.id}
                    type="button"
                    onClick={() => setActiveTierId(isActive ? null : tier.id)}
                    variants={{
                      hidden: { opacity: 0, x: 20 },
                      visible: { opacity: 1, x: 0 },
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                      isActive
                        ? "border-(--accent) bg-(--accent)/10"
                        : "border-white/10 bg-[#1a1a1a] hover:bg-[#222]"
                    }`}
                  >
                    <motion.div
                      animate={isActive ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className="size-6 shrink-0 rounded"
                      style={{ backgroundColor: tier.color }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-white">{tier.name}</p>
                      <p className="text-xs text-gray-400">{formatPrice(tier.price)}</p>
                    </div>
                    {count > 0 && (
                      <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-medium text-gray-300 tabular-nums">
                        {count}
                      </span>
                    )}
                    <AnimatePresence>
                      {isActive && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="text-xs font-bold text-(--accent)"
                        >
                          {t("organizer.seatConfig.active", "Đang chọn")}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </div>

        {/* Instructions */}
        <motion.div
          key={activeTierId ? "active" : "inactive"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="p-4 md:p-6 bg-[#262626] border-t border-white/5"
        >
          <p className="text-xs text-gray-500 leading-relaxed">
            {activeTierId
              ? t("organizer.seatConfig.instructions", "Click vào ghế hoặc kéo thả để gán hạng vé đã chọn. Click ghế đã gán để bỏ chọn.")
              : t("organizer.seatConfig.selectFirst", "Chọn hạng vé để gán ghế, hoặc click ghế đã gán để bỏ chọn.")}
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
