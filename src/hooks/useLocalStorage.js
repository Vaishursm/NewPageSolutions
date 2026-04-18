import { useEffect, useRef, useState } from "react";

export function useLocalStorage(key, initialValue) {
  // Always start with initialValue on both server and first client render
  // to avoid SSR hydration mismatches. Hydrate from storage after mount.
  const [value, setValue] = useState(initialValue);
  const hydrated = useRef(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) setValue(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    hydrated.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (!hydrated.current) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* ignore quota errors */
    }
  }, [key, value]);

  return [value, setValue];
}
