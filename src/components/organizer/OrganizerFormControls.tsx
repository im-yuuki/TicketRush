import { Button, Card, Dropdown, Input } from "@heroui/react";
import { ChevronDown, ImagePlus } from "lucide-react";
import { useState, type Key, type ReactNode } from "react";
import type { VietnamLocalityOption } from "../../data/vietnamAdministrativeUnits";

export function OrganizerUploadBox({
  title,
  size,
  className = "",
}: {
  title: string;
  size: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={`flex min-h-72 w-full flex-col items-center justify-center gap-5 rounded-lg border border-dashed border-border bg-surface-secondary p-6 text-center text-foreground transition-colors hover:bg-surface-tertiary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${className}`}
    >
      <ImagePlus className="size-11 text-accent" strokeWidth={2.25} />
      <span className="max-w-56 text-base font-semibold leading-6">
        {title}
        <strong className="mt-1 block text-sm">({size})</strong>
      </span>
    </button>
  );
}

export function OrganizerFieldLabel({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  return (
    <label className="block text-sm font-bold" htmlFor={htmlFor}>
      <span className="text-danger">*</span> {children}
    </label>
  );
}

export function OrganizerCharacterInput({
  placeholder,
  maxLength,
}: {
  placeholder: string;
  maxLength: number;
}) {
  const [value, setValue] = useState("");

  return (
    <OrganizerCountedInput
      value={value}
      maxLength={maxLength}
      placeholder={placeholder}
      onChange={setValue}
    />
  );
}

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

export function OrganizerSearchableLocationDropdown({
  id,
  selectedCode,
  selectedOption,
  options,
  placeholder,
  searchPlaceholder,
  searchValue,
  emptyMessage,
  isDisabled = false,
  onSearchChange,
  onSelect,
}: {
  id: string;
  selectedCode: string;
  selectedOption?: VietnamLocalityOption;
  options: VietnamLocalityOption[];
  placeholder: string;
  searchPlaceholder: string;
  searchValue: string;
  emptyMessage: string;
  isDisabled?: boolean;
  onSearchChange: (value: string) => void;
  onSelect: (key: Key) => void;
}) {
  return (
    <Dropdown>
      <Dropdown.Trigger>
        <Button
          id={id}
          variant="tertiary"
          isDisabled={isDisabled}
          className={`h-10 w-full justify-between rounded-md border border-border bg-white px-3 text-left text-sm font-normal hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60 ${
            selectedOption ? "text-slate-900" : "text-slate-400"
          }`}
        >
          <span className="min-w-0 truncate">{selectedOption?.name ?? placeholder}</span>
          <ChevronDown className="size-4 shrink-0 text-slate-500" />
        </Button>
      </Dropdown.Trigger>
      <Dropdown.Popover>
        <div className="w-[min(24rem,calc(100vw-2rem))]">
          <div className="border-b border-border p-2">
            <Input
              value={searchValue}
              placeholder={searchPlaceholder}
              autoFocus
              onInput={(event) => onSearchChange(event.currentTarget.value)}
              className="h-9 w-full rounded-md border border-border bg-white text-sm text-slate-900 placeholder:text-slate-400"
            />
          </div>
          {options.length > 0 ? (
            <Dropdown.Menu
              onAction={onSelect}
              selectionMode="single"
              selectedKeys={selectedCode ? new Set([selectedCode]) : new Set()}
            >
              {options.map((option) => (
                <Dropdown.Item id={option.code} key={option.code} textValue={option.name}>
                  <Dropdown.ItemIndicator />
                  <span>{option.name}</span>
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          ) : (
            <div className="px-3 py-2 text-sm text-slate-500">{emptyMessage}</div>
          )}
        </div>
      </Dropdown.Popover>
    </Dropdown>
  );
}

export function OrganizerFormPanel({
  children,
  className = "",
  contentClassName = "gap-5 p-5 md:p-6",
}: {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  return (
    <Card className={`border border-border bg-surface text-foreground ${className}`}>
      <Card.Content className={contentClassName}>{children}</Card.Content>
    </Card>
  );
}
