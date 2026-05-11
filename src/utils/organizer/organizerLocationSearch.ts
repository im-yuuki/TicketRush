import type { VietnamLocalityOption } from "../../data/vietnamAdministrativeUnits";

export function normalizeLocationQuery(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\u0111/g, "d")
    .replace(/\u0110/g, "D")
    .toLowerCase()
    .trim();
}

export function filterLocationOptions(
  options: VietnamLocalityOption[],
  query: string,
) {
  const normalizedQuery = normalizeLocationQuery(query);
  if (!normalizedQuery) return options;

  return options.filter((option) => {
    const normalizedName = normalizeLocationQuery(option.name);
    return normalizedName.includes(normalizedQuery) || option.code.includes(normalizedQuery);
  });
}
