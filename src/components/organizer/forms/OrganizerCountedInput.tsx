import { Input } from "@heroui/react";

export function OrganizerCountedInput({
  value,
  onChange,
  maxLength,
  type = "text",
  id,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
  type?: string;
  id?: string;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <Input
        id={id}
        type={type}
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        onInput={(event) => onChange(event.currentTarget.value)}
        className="w-full rounded-md border border-border bg-white pr-20 text-slate-900 placeholder:text-slate-400"
      />
      <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-sm text-slate-500">
        {value.length} / {maxLength}
      </span>
    </div>
  );
}
