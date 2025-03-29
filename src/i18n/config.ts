import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import fiTranslation from "./fi/translation.json";
import svTranslation from "./sv/translation.json";
import enTranslation from "./en/translation.json";
import fiOpdsClientTranslation from "@natlibfi/ekirjasto-web-opds-client/lib/i18n/en/translation.json";
import svOpdsClientTranslation from "@natlibfi/ekirjasto-web-opds-client/lib/i18n/sv/translation.json";
import enOpdsClientTranslation from "@natlibfi/ekirjasto-web-opds-client/lib/i18n/en/translation.json";

export const defaultNS = "translation";
export const resources = {
  fi: {
    translation: {
      ...fiOpdsClientTranslation,
      ...fiTranslation,
    },
  },
  sv: {
    translation: {
      ...svOpdsClientTranslation,
      ...svTranslation,
    },
  },
  en: {
    translation: {
      ...enOpdsClientTranslation,
      ...enTranslation,
    },
  },
} as const;

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    fallbackLng: "en",
    defaultNS: defaultNS,
    returnEmptyString: false,
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    resources: resources,
  });

export default i18n;
