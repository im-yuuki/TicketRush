import { Button, Dropdown, Input } from "@heroui/react";
import { ChevronDown } from "lucide-react";
import type { Key } from "react";
import type { VietnamLocalityOption } from "../../../data/vietnamAdministrativeUnits";

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
