import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import Backend from "i18next-http-backend";

export type LanguageOption = { code: string; name: string; icon?: string };

export const languageOptions: LanguageOption[] = [
  { code: "vn", name: "Tiếng Việt", icon: "🇻🇳" },
  { code: "en", name: "English", icon: "🇺🇸" },
];

export function getCurrentLanguage() {
  return (
    getLanguage(i18next.language) ||
    languageOptions[0]
  );
}

export function getLanguage(languageCode: string) {
  return languageOptions.find((option) => option.code === languageCode);
}

export function changeLanguage(languageCode: string) {
  const selectedLanguage = getLanguage(languageCode);
  if (!selectedLanguage) {
    console.warn(`Unsupported language code: ${languageCode}`);
    return null;
  }
  i18next.changeLanguage(selectedLanguage.code);
  console.log(`Language changed to ${selectedLanguage.name} (${selectedLanguage.code})`);
  return selectedLanguage;
}

i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  .use(Backend)
  .init({
    supportedLngs: languageOptions.map((option) => option.code),
    returnObjects: true,
    fallbackLng: "en",
    debug: false,
  });
