import { useState, useMemo, useCallback, useEffect, type CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";

// ── Types ───────────────────────────────────────────────────────────────

export type SeatStatus = "available" | "selected" | "booked";

export interface Seat {
  id: string;
  row: string;
  number: number;
  status: SeatStatus;
  tierId?: string;
}

export interface SeatRow {
  label: string;
  count: number;
  tierId?: string;
}

export interface SeatBlock {
  id: string;
  name: string;
  rows: SeatRow[];
}

export interface VenueLayout {
  id: string;
  name: string;
  blocks: SeatBlock[];
}

// ── Styles ──────────────────────────────────────────────────────────────

const SEAT_SIZE = 24;
const SEAT_GAP = 4;

const seatBase: CSSProperties = {
  width: SEAT_SIZE,
  height: SEAT_SIZE,
  borderRadius: 5,
  border: "1.5px solid var(--border)",
  cursor: "pointer",
  transition: "background-color .15s, border-color .15s, box-shadow .15s",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "0.5rem",
  fontWeight: 600,
  userSelect: "none",
  position: "relative",
  overflow: "visible",
};

const seatStyles: Record<SeatStatus, CSSProperties> = {
  available: {
    ...seatBase,
    backgroundColor: "var(--surface)",
    color: "var(--foreground)",
  },
  selected: {
    ...seatBase,
    backgroundColor: "var(--accent)",
    borderColor: "var(--accent)",
    color: "black",
    boxShadow: "0 2px 10px oklch(83.77% 0.1655 81.92 / 0.35)",
  },
  booked: {
    ...seatBase,
    backgroundColor: "oklch(78.19% 0.1585 51.7)",
    borderColor: "oklch(70% 0.15 51.7)",
    color: "oklch(30% 0.05 51.7)",
    cursor: "not-allowed",
    opacity: 0.7,
  },
};

const swatchBase: CSSProperties = {
  width: 16,
  height: 16,
  borderRadius: 4,
  border: "1.5px solid var(--border)",
};

// ── Individual Seat ─────────────────────────────────────────────────────

interface SeatButtonProps {
  seat: Seat;
  color?: string;
  assignedColor?: string;
  configMode?: boolean;
  onToggle: (seatId: string) => void;
}

function SeatButton({ seat, color, assignedColor, configMode, onToggle }: SeatButtonProps) {
  const handleClick = () => {
    if (configMode || seat.status !== "booked") onToggle(seat.id);
  };

  let dynamicStyle: CSSProperties;

  if (configMode) {
    // Config mode: ignore selected/booked, only show tier assignment colors
    dynamicStyle = { ...seatStyles.available };
    if (assignedColor) {
      dynamicStyle.borderColor = assignedColor;
      dynamicStyle.backgroundColor = assignedColor + "33";
    } else if (color) {
      dynamicStyle.borderColor = color;
    }
  } else {
    dynamicStyle = { ...seatStyles[seat.status] };
    if (seat.status === "available") {
      if (assignedColor) {
        dynamicStyle.borderColor = assignedColor;
        dynamicStyle.backgroundColor = assignedColor + "33";
      } else if (color) {
        dynamicStyle.borderColor = color;
      }
    }
  }

  return (
    <motion.button
      type="button"
      data-seat-id={seat.id}
      style={dynamicStyle}
      onClick={handleClick}
      aria-label={`Row ${seat.row}, Seat ${seat.number} — ${seat.status}`}
      aria-disabled={!configMode && seat.status === "booked"}
      whileHover={{ scale: 1.25 }}
      whileTap={{ scale: 0.85 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
    >
      {seat.number}
    </motion.button>
  );
}

// ── Main SeatMap Component ──────────────────────────────────────────────

interface SeatMapProps {
  /** Venue layout definition (required) */
  layout: VenueLayout;
  /** Array of seat IDs that are currently booked. This should come from a realtime API. */
  bookedSeatIds?: string[];
  /** Callback when the current user's seat selection changes */
  onSelectionChange?: (selectedSeatIds: string[]) => void;
  /** Maximum number of seats allowed to select */
  maxSeats?: number;
  /** Map of tierId to color code */
  tierColors?: Record<string, string>;
  /** Map of seatId → color for displaying assigned tier colors on seats */
  assignedSeatColors?: Record<string, string>;
  /** When true, disables selected/booked styling — used for seat configuration mode */
  configMode?: boolean;
}

export default function SeatMap({ layout, bookedSeatIds = [], onSelectionChange, maxSeats, tierColors, assignedSeatColors, configMode }: SeatMapProps) {
  if (!layout) throw new Error("SeatMap requires a layout prop");

  const { t } = useTranslation();

  // Local state ONLY tracks what the *current user* is selecting right now.
  const [selectedSeatIds, setSelectedSeatIds] = useState<Set<string>>(new Set());
  const [maxSeatsReached, setMaxSeatsReached] = useState(false);

  // Derived state: Quick lookup for booked seats (from server)
  const bookedSeatsSet = useMemo(() => new Set(bookedSeatIds), [bookedSeatIds]);

  // Auto-deselect seats that became booked by others (from polling updates)
  useEffect(() => {
    setSelectedSeatIds((prev) => {
      const next = new Set(prev);
      let changed = false;
      for (const id of prev) {
        if (bookedSeatsSet.has(id)) {
          next.delete(id);
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [bookedSeatsSet]);

  // Derived state: Generate the full physical grid of seats on the fly based on layout + states
  const venueBlocks = useMemo(() => {
    return layout.blocks.map((block) => {
      const rows = block.rows.map((rowDef) => {
        const seats: Seat[] = [];
        for (let i = 1; i <= rowDef.count; i++) {
          const seatId = `${block.id}-${rowDef.label}-${i}`;
          
          let status: SeatStatus = "available";
          if (!configMode) {
            if (bookedSeatsSet.has(seatId)) status = "booked";
            else if (selectedSeatIds.has(seatId)) status = "selected";
          }

          seats.push({
            id: seatId,
            row: rowDef.label,
            number: i,
            status,
            tierId: rowDef.tierId,
          });
        }
        return { label: rowDef.label, seats };
      });
      return { id: block.id, name: block.name, rows };
    });
  }, [layout, bookedSeatsSet, selectedSeatIds, configMode]);

  const toggleSeat = useCallback((seatId: string) => {
    if (configMode) {
      // Config mode: don't accumulate selections, just report the clicked seat
      if (onSelectionChange) onSelectionChange([seatId]);
      return;
    }

    // If it's booked by someone else on the server, cannot interact
    if (bookedSeatsSet.has(seatId)) return;

    setSelectedSeatIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(seatId)) {
        // Deselect
        newSet.delete(seatId);
        setMaxSeatsReached(false);
      } else {
        // Select
        if (maxSeats !== undefined && newSet.size >= maxSeats) {
          setMaxSeatsReached(true);
          return prev;
        }
        newSet.add(seatId);
        setMaxSeatsReached(false);
      }
      return newSet;
    });
  }, [bookedSeatsSet, maxSeats, configMode, onSelectionChange]);

  // Sync selected seats up to parent whenever the Set changes (skip in configMode, handled in toggleSeat)
  useEffect(() => {
    if (configMode) return;
    if (onSelectionChange) {
      onSelectionChange(Array.from(selectedSeatIds));
    }
  }, [selectedSeatIds, onSelectionChange, configMode]);

  const selectedCount = selectedSeatIds.size;
  const sortedSelectedList = useMemo(() => {
    return Array.from(selectedSeatIds)
      .map((id) => {
        const parts = id.split("-");
        const row = parts[parts.length - 2];
        const num = parts[parts.length - 1];
        return `${row}${num}`; // format "A1", "B2"
      })
      .sort();
  }, [selectedSeatIds]);

  return (
    <div className="w-full overflow-x-auto overflow-y-visible" id="seat-map">
      {/* ── Seating Blocks ─────────────────────────────────────────── */}
      <motion.div
        className="flex justify-center min-w-fit"
        style={{ gap: 24, padding: "8px 16px 16px" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        {venueBlocks.map((block, blockIdx) => (
          <motion.div
            key={block.id}
            className="flex flex-col items-center gap-0.5"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.15 * blockIdx }}
          >
            <span className="text-[0.7rem] font-bold tracking-[0.15em] uppercase mb-2 text-muted">
              {block.name}
            </span>

            {block.rows.map((row) => (
              <div
                key={row.label}
                className="flex items-center"
                style={{ gap: SEAT_GAP, height: SEAT_SIZE + SEAT_GAP }}
              >
                <span className="w-[18px] text-center text-[0.6rem] font-semibold text-muted shrink-0 select-none">
                  {row.label}
                </span>
                {row.seats.map((seat) => (
                  <SeatButton 
                    key={seat.id} 
                    seat={seat} 
                    color={tierColors?.[seat.tierId || ""]} 
                    assignedColor={assignedSeatColors?.[seat.id]}
                    configMode={configMode}
                    onToggle={toggleSeat} 
                  />
                ))}
                <span className="w-[18px] text-center text-[0.6rem] font-semibold text-muted shrink-0 select-none">
                  {row.label}
                </span>
              </div>
            ))}
          </motion.div>
        ))}
      </motion.div>

      {/* ── Legend ──────────────────────────────────────────────────── */}
      <div className="flex justify-center gap-5 pt-5 px-4 pb-2 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
          <span style={{ ...swatchBase, backgroundColor: "var(--surface)" }} />
          {t("seatMap.available")}
        </div>
        <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
          <span style={{ ...swatchBase, backgroundColor: "var(--accent)", borderColor: "var(--accent)" }} />
          {t("seatMap.selected")}
        </div>
        <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
          <span style={{ ...swatchBase, backgroundColor: "oklch(78.19% 0.1585 51.7)", borderColor: "oklch(70% 0.15 51.7)", opacity: 0.7 }} />
          {t("seatMap.booked")}
        </div>
      </div>

      {/* ── Selection Summary ──────────────────────────────────────── */}
      <AnimatePresence>
        {selectedCount > 0 && (
          <motion.div
            className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-muted"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
          >
            <span className="tabular-nums text-(--accent)">
              {selectedCount}
            </span>
            {t("seatMap.seatsSelected", { count: selectedCount })}
            <span className="text-xs opacity-50">
              ({sortedSelectedList.join(", ")})
            </span>
          </motion.div>
        )}
        {maxSeatsReached && (
          <motion.div
            className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-orange-500"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
          >
            ⚠️ {t("seatMap.maxSeatsReached", { max: maxSeats })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
