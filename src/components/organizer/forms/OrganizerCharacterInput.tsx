import { useState } from "react";
import { OrganizerCountedInput } from "./OrganizerCountedInput";

export function OrganizerCharacterInput({
  placeholder,
  maxLength,
  value,
  onChange,
}: {
  placeholder: string;
  maxLength: number;
  value?: string;
  onChange?: (value: string) => void;
}) {
  const [internalValue, setInternalValue] = useState("");
  const currentValue = value ?? internalValue;
  const handleChange = onChange ?? setInternalValue;

  return (
    <OrganizerCountedInput
      value={currentValue}
      maxLength={maxLength}
      placeholder={placeholder}
      onChange={handleChange}
    />
  );
}
