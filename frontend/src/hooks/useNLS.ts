import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";

type Translations = Record<string, string>;
type Languages = Record<string, string>;

const API_URL = "http://localhost:8000/api/v1";
const DEFAULT_LANGUAGE = "de";
const STORAGE_KEY = "app_language";

export function useNLS() {
  const [translations, setTranslations] = useState<Translations>({});
  const [languages, setLanguages] = useState<Languages>({});
  const [currentLanguage, setCurrentLanguage] = useState<string>(
    localStorage.getItem(STORAGE_KEY) || DEFAULT_LANGUAGE
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const loadingRef = useRef<string | null>(null);
  const loadLanguages = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/translations/languages`);
      setLanguages(response.data);
    } catch (err) {
      console.error("Fehler beim Laden der Sprachen:", err);
      setError("Sprachen konnten nicht geladen werden");
    }
  }, []);

  const loadTranslations = useCallback(async (lang: string) => {
    const loadId = `${lang}_${Date.now()}`;
    loadingRef.current = loadId;

    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/translations/${lang}`);

      if (loadingRef.current === loadId) {
        setTranslations(response.data);
        localStorage.setItem(STORAGE_KEY, lang);
        setCurrentLanguage(lang);
      }
    } catch (err) {
      console.error(`Fehler beim Laden der Übersetzungen für ${lang}:`, err);

      if (loadingRef.current === loadId) {
        setError(`Übersetzungen für ${lang} konnten nicht geladen werden`);

        if (lang !== DEFAULT_LANGUAGE) {
          loadTranslations(DEFAULT_LANGUAGE);
        }
      }
    } finally {
      if (loadingRef.current === loadId) {
        setIsLoading(false);
        loadingRef.current = null;
      }
    }
  }, []);

  const changeLanguage = useCallback(
    (lang: string) => {
      if (lang !== currentLanguage) {
        loadTranslations(lang);
      }
    },
    [currentLanguage, loadTranslations]
  );

  const t = useCallback(
    (
      key: string,
      params?: Record<string, string | number | boolean>
    ): string => {
      if (!translations[key]) {
        return key;
      }

      let text = translations[key];

      if (params) {
        Object.entries(params).forEach(([paramKey, paramValue]) => {
          text = text.replace(
            new RegExp(`{${paramKey}}`, "g"),
            String(paramValue)
          );
        });
      }

      return text;
    },
    [translations]
  );

  useEffect(() => {
    loadLanguages();
    loadTranslations(currentLanguage);
    return () => {
      loadingRef.current = "unmounted";
    };
  }, [currentLanguage, loadLanguages, loadTranslations]);

  return {
    t,
    languages,
    currentLanguage,
    changeLanguage,
    isLoading,
    error,
  };
}
