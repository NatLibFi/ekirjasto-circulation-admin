import * as React from "react";
import i18n from "../../i18n/config";
import EditableInput from "../../components/EditableInput";

const changeLanguage = (lang: string) => {
  i18n.changeLanguage(lang);
  document.documentElement.lang = lang;
  window.location.reload(); // Reload for fetching backend-translated strings
};

export function LanguageSwitcher() {
  React.useEffect(() => {
    const storedLang = localStorage.getItem("i18nextLng");
    if (
      !storedLang ||
      !Object.keys(i18n.options.resources).includes(storedLang)
    ) {
      const fallback = i18n.options.fallbackLng[0];
      changeLanguage(fallback);
    }
  }, []);

  return (
    <EditableInput
      className="language-switcher"
      elementType="select"
      value={i18n.language}
      onChange={(value) => {
        changeLanguage(value);
      }}
      aria-label="language"
    >
      {Object.keys(i18n.options.resources).map((lang) => (
        <option key={lang} value={lang}>
          {lang}
        </option>
      ))}
    </EditableInput>
  );
}
