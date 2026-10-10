import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import WorldMap from "./WorldMap.jsx";

const SPLASH_MS = 2860;

export default function Splash({ onDone }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      onDone?.();
    }, SPLASH_MS);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: "var(--bg)" }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 0.55, scale: 1 }}
            transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 pointer-events-none"
            style={{ padding: 0, transform: "scale(1.6)" }}
          >
            <div className="absolute inset-0" style={{ background: "rgba(255, 255, 255, 0.55)", backdropFilter: "blur(40px) saturate(180%)", WebkitBackdropFilter: "blur(40px) saturate(180%)" }} />
            <WorldMap
              dotColor="#2AA5B0"
              activeColor="#3B7BFF"
              animateHotSpots
            />
          </motion.div>

          <motion.div
            className="absolute rounded-full pointer-events-none"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
            style={{
              width: "min(80vw, 620px)",
              height: "min(80vw, 620px)",
              background:
                "radial-gradient(circle, rgba(59,123,255,0.20) 0%, rgba(59,123,255,0.06) 40%, transparent 70%)",
              filter: "blur(80px)",
            }}
          />

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.5 }}
            className="relative z-10 mt-4 text-sm tracking-widest uppercase"
            style={{ color: "var(--text-secondary)", letterSpacing: "0.2em" }}
          >
            Connecting the world
          </motion.p>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.4, duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 mt-8 origin-center"
            style={{
              width: "min(40vw, 160px)",
              height: 2,
              background:
                "linear-gradient(90deg, transparent 0%, #3B7BFF 50%, transparent 100%)",
              borderRadius: 2,
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
