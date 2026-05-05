import { Ticket } from "lucide-react";

export function EventMarquee({ text }: { text: string }) {
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
