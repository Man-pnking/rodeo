import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SPLASH_MS = 2000;

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
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: "#050510" }}
        >
          <motion.div
            className="absolute rounded-full pointer-events-none"
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
            style={{
              width: "min(80vw, 600px)",
              height: "min(80vw, 600px)",
              background:
                "radial-gradient(circle, rgba(168,85,247,0.4) 0%, rgba(255,110,199,0.12) 40%, transparent 70%)",
              filter: "blur(80px)",
            }}
          />

          <motion.h1
            initial={{ opacity: 0, y: 20, letterSpacing: "0.3em" }}
            animate={{ opacity: 1, y: 0, letterSpacing: "-0.03em" }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 gradient-text"
            style={{
              fontFamily: '"Space Grotesk", Inter, sans-serif',
              fontSize: "clamp(3rem, 12vw, 5.5rem)",
              fontWeight: 800,
              lineHeight: 1,
            }}
          >
            Rodeo
          </motion.h1>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.9, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 mt-6 origin-center"
            style={{
              width: "min(40vw, 180px)",
              height: 2,
              background: "linear-gradient(90deg, transparent 0%, #ff6ec7 20%, #a855f7 50%, #3b82f6 80%, transparent 100%)",
              borderRadius: 2,
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
