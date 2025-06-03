import { useMemo } from "react";
import { useNLSContext } from "../context/NLSContext";

interface LanguageSelectorProps {
  className?: string;
  value: string;
  setLanguage: (lang: string) => void;
}

export function LanguageSelector({
  className = "",
  value,
  setLanguage,
}: LanguageSelectorProps) {
  const { languages, t } = useNLSContext();

  const sortedLanguages = useMemo(() => {
    return Object.entries(languages).sort((a, b) => a[1].localeCompare(b[1]));
  }, [languages]);

  return (
    <select
      value={value}
      onChange={(e) => setLanguage(e.target.value)}
      className={`bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      aria-label={t("language")}
    >
      {sortedLanguages.map(([code, name]) => (
        <option key={code} value={code}>
          {name}
        </option>
      ))}
    </select>
  );
}
