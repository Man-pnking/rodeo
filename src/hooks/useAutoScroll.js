import { useEffect, useRef } from "react";

/**
 * Returns a ref for a scrollable container. Auto-scrolls to bottom when
 * `dep` changes, unless the user has manually scrolled up.
 */
export function useAutoScroll(dep) {
  const scrollRef = useRef(null);
  const stickRef = useRef(true);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const distanceFromBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight;
      stickRef.current = distanceFromBottom < 80;
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (stickRef.current) el.scrollTop = el.scrollHeight;
  }, [dep]);

  return scrollRef;
}
