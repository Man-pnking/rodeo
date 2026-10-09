import { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "rodeo-theme";
const ThemeContext = createContext(null);

function getSystemTheme() {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    if (typeof window === "undefined") return "dark";
    return localStorage.getItem(STORAGE_KEY) || "light";
  });

  const [resolved, setResolved] = useState(() =>
    mode === "system" ? getSystemTheme() : mode
  );

  useEffect(() => {
    const update = () => {
      const r = mode === "system" ? getSystemTheme() : mode;
      setResolved(r);
      const root = document.documentElement;
      if (r === "dark") root.classList.add("dark");
      else root.classList.remove("dark");
      root.style.colorScheme = r;
    };
    update();

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = () => mode === "system" && update();
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, [mode]);

  const setTheme = (next) => {
    setMode(next);
    localStorage.setItem(STORAGE_KEY, next);
  };

  return (
    <ThemeContext.Provider value={{ mode, resolved, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be inside ThemeProvider");
  return ctx;
}
