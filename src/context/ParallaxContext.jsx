import { createContext, useContext, useEffect, useState } from "react";

const ParallaxContext = createContext(null);

export function ParallaxProvider({ children }) {
  const [scrollY, setScrollY] = useState(0);
  const [velocity, setVelocity] = useState(0);

  useEffect(() => {
    let last = 0;
    let raf = null;

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        const v = y - last;
        last = y;
        setScrollY(y);
        setVelocity(v);
        raf = null;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <ParallaxContext.Provider value={{ scrollY, velocity }}>
      {children}
    </ParallaxContext.Provider>
  );
}

export function useParallaxScroll() {
  const ctx = useContext(ParallaxContext);
  if (!ctx) return { scrollY: 0, velocity: 0 };
  return ctx;
}
