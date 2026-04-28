"use client";

import { useLocale } from "next-intl";
import { useEffect } from "react";

/** Keeps `<html lang>` aligned with URL locale (accessibility + regional UA/KZ/RU rendering). */
export function LocaleHtmlLang() {
  const locale = useLocale();

  useEffect(() => {
    const lang =
      locale === "ka" ? "ka" : locale === "ru" ? "ru" : locale === "en" ? "en" : "en";
    document.documentElement.lang = lang;
  }, [locale]);

  return null;
}
