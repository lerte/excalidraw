import React from "react";
import { appLangCodeAtom } from "../App";
import { languages } from "../../packages/excalidraw/i18n";
import { useI18n } from "../../packages/excalidraw/i18n";
import { useSetAtom } from "jotai";

export const LanguageList = ({ style }: { style?: React.CSSProperties }) => {
  const { t, langCode } = useI18n();
  const setLangCode = useSetAtom(appLangCodeAtom);

  return (
    <select
      style={style}
      value={langCode}
      className="dropdown-select dropdown-select__language"
      onChange={({ target }) => setLangCode(target.value)}
      aria-label={t("buttons.selectLanguage")}
    >
      {languages.map((lang) => (
        <option
          key={lang.code}
          value={lang.code}
        >
          {lang.label}
        </option>
      ))}
    </select>
  );
};
