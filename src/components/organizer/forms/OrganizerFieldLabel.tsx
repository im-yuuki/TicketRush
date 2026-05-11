import type { ReactNode } from "react";

export function OrganizerFieldLabel({
  children,
  htmlFor,
}: {
  children: ReactNode;
  htmlFor?: string;
}) {
  return (
    <label className="block text-sm font-bold" htmlFor={htmlFor}>
      <span className="text-danger">*</span> {children}
    </label>
  );
}
