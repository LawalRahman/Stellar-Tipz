import React from "react";
import { useTranslation } from "react-i18next";

import i18n, {
  fallbackLanguage,
  languageNames,
  normalizeLanguage,
  supportedLanguages,
  type Language,
} from "./config";

export {
  LANGUAGE_STORAGE_KEY,
  detectPreferredLanguage,
  fallbackLanguage,
  isRtlLanguage,
  isSupportedLanguage,
  languageNames,
  normalizeLanguage,
  supportedLanguages,
  type Language,
} from "./config";
export { default as i18n } from "./config";

type TranslationParams = Record<string, string | number>;

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => React.createElement(React.Fragment, null, children);

export const useI18n = () => {
  const { i18n: i18next, t: translate } = useTranslation();
  const language =
    normalizeLanguage(i18next.resolvedLanguage ?? i18next.language) ??
    fallbackLanguage;

  const setLanguage = React.useCallback(
    (nextLanguage: Language) => {
      void i18next.changeLanguage(nextLanguage);
    },
    [i18next],
  );

  const t = React.useCallback(
    (key: string, params?: TranslationParams) =>
      String(translate(key, { defaultValue: key, ...params })),
    [translate],
  );

  return React.useMemo(
    () => ({
      language,
      languageNames,
      languages: supportedLanguages,
      setLanguage,
      t,
    }),
    [language, setLanguage, t],
  );
};

export default i18n;
