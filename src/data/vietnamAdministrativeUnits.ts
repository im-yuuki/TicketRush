import rawAdministrativeUnits from "./vnAdministrativeUnits.raw.json";

type RawWard = {
  Code: string;
  FullName: string;
  ProvinceCode: string;
};

type RawProvince = {
  Code: string;
  FullName: string;
  Wards: RawWard[];
};

export type VietnamLocalityOption = {
  code: string;
  name: string;
  provinceCode?: string;
};

type VietnamProvince = VietnamLocalityOption & {
  wards: VietnamLocalityOption[];
};

const vietnamAdministrativeUnits: VietnamProvince[] = (rawAdministrativeUnits as RawProvince[]).map((province) => ({
  code: province.Code,
  name: province.FullName,
  wards: province.Wards.map((ward) => ({
    code: ward.Code,
    name: ward.FullName,
    provinceCode: ward.ProvinceCode,
  })),
}));

const vietnamWardsByProvinceCode = Object.fromEntries(
  vietnamAdministrativeUnits.map((province) => [province.code, province.wards]),
);

export const vietnamProvinces: VietnamLocalityOption[] = vietnamAdministrativeUnits.map((province) => ({
  code: province.code,
  name: province.name,
}));

export function getVietnamWardsByProvinceCode(provinceCode: string) {
  return vietnamWardsByProvinceCode[provinceCode] ?? [];
}
