import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";

const STEPS = [
  "payment.stepSelectTicket",
  "payment.stepEnterInfo",
  "payment.stepPayment",
] as const;

export function StepIndicator({ current }: { current: number }) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-1 md:gap-2">
      {STEPS.map((key, idx) => {
        const done = idx < current;
        const active = idx === current;
        return (
          <div key={key} className="flex items-center gap-1 md:gap-2">
            <div
              className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0 transition-colors ${
                done
                  ? "bg-emerald-500 text-white"
                  : active
                    ? "bg-(--accent) text-black"
                    : "bg-white/10 text-white/40"
              }`}
            >
              {done ? <Check size={14} /> : idx + 1}
            </div>
            <span
              className={`text-xs md:text-sm font-medium whitespace-nowrap transition-colors ${
                active
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
