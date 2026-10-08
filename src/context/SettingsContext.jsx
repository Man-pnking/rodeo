import { createContext, useContext } from "react";
import { useAuth } from "../hooks/useAuth";
import { useSettings } from "../hooks/useSettings";

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const { user } = useAuth();
  const settings = useSettings(user?.id);
  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettingsContext() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettingsContext must be inside SettingsProvider");
  return ctx;
}
