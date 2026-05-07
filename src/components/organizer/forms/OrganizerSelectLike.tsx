import { ChevronDown } from "lucide-react";

export function OrganizerSelectLike({ placeholder }: { placeholder: string }) {
  return (
    <button
      type="button"
      className="flex h-10 w-full items-center justify-between rounded-md border border-border bg-white px-3 text-left text-sm text-slate-400"
    >
      {placeholder}
      <ChevronDown className="size-4 text-slate-500" />
    </button>
  );
}
