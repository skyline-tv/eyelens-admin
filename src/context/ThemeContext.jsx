import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "eyelens_theme";

const ThemeContext = createContext({
  resolved: "light",
  toggle: () => {},
});

function getStored() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function ThemeProvider({ children }) {
  const [preference, setPreference] = useState(() => getStored());
  const [systemDark, setSystemDark] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setSystemDark(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const resolved = useMemo(() => {
    if (preference === "light" || preference === "dark") return preference;
    return systemDark ? "dark" : "light";
  }, [preference, systemDark]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", resolved === "dark");
  }, [resolved]);

  const toggle = useCallback(() => {
    const next = resolved === "dark" ? "light" : "dark";
    setPreference(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, [resolved]);

  const value = useMemo(() => ({ resolved, toggle }), [resolved, toggle]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
