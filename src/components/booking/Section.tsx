import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export function Section({
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
