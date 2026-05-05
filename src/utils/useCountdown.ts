import { useState, useEffect, useRef } from "react";

/**
 * Countdown hook. Accepts either:
 * - seconds: raw countdown from mount
 * - expiresAt: ISO timestamp to count down to (takes priority)
 */
export function useCountdown(opts: { seconds?: number; expiresAt?: string }) {
  const computeRemaining = (): number => {
    if (opts.expiresAt) {
      const target = new Date(opts.expiresAt).getTime();
      if (isNaN(target)) return opts.seconds ?? 600;
      const ms = target - Date.now();
      return Math.max(0, Math.floor(ms / 1000));
    }
    return opts.seconds ?? 600;
  };

  const [remaining, setRemaining] = useState(computeRemaining);

  // Reset when expiresAt changes (e.g. navigating between pages)
  const prevExpiresAt = useRef(opts.expiresAt);
  useEffect(() => {
    if (opts.expiresAt !== prevExpiresAt.current) {
      prevExpiresAt.current = opts.expiresAt;
      setRemaining(computeRemaining());
    }
  }, [opts.expiresAt]);

  useEffect(() => {
    if (remaining <= 0) return;
    const id = setInterval(() => setRemaining((r) => r - 1), 1000);
    return () => clearInterval(id);
  }, [remaining]);

  const m = Math.floor(remaining / 60);
  const s = remaining % 60;
  return { m, s, expired: remaining <= 0 };
}
