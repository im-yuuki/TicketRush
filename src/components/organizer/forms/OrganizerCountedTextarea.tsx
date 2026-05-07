export function OrganizerCountedTextarea({
  value,
  onChange,
  maxLength,
  className = "min-h-28",
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
  className?: string;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <textarea
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        onInput={(event) => onChange(event.currentTarget.value)}
        className={`${className} w-full resize-y rounded-md border border-border bg-white p-3 pr-20 text-sm text-slate-900 outline-none placeholder:text-slate-400`}
      />
      <span className="pointer-events-none absolute right-4 bottom-3 text-sm text-slate-500">
        {value.length} / {maxLength}
      </span>
    </div>
  );
}
