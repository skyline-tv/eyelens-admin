import { useEffect, useState } from "react";

/** True briefly on mount — for static tabs that have no async fetch but need a skeleton flash. */
export function useBriefSkeleton(ms = 450) {
  const [active, setActive] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setActive(false), ms);
    return () => clearTimeout(t);
  }, [ms]);
  return active;
}
