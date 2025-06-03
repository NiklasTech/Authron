import React, { createContext, useContext } from "react";
import { useNLS } from "../hooks/useNLS";

interface NLSContextType {
  t: (key: string, params?: Record<string, string | number>) => string;
  languages: Record<string, string>;
  currentLanguage: string;
  changeLanguage: (lang: string) => void;
  isLoading: boolean;
  error: string | null;
}

const NLSContext = createContext<NLSContextType | null>(null);

export const useNLSContext = () => {
  const context = useContext(NLSContext);
  if (!context) {
    throw new Error("useNLSContext must be used within an NLSProvider");
  }
  return context;
};

export const NLSProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const nls = useNLS();

  return <NLSContext.Provider value={nls}>{children}</NLSContext.Provider>;
};
