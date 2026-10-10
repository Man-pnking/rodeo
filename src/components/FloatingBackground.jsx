import { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import WorldMap from "./WorldMap.jsx";

export default function FloatingBackground({ intensity = 1 }) {
  const containerRef = useRef(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [mounted, setMounted] = useState(false);

  // Smooth springs for the parallax
  const smoothX = useSpring(mouseX, { stiffness: 60, damping: 20, mass: 0.5 });
  const smoothY = useSpring(mouseY, { stiffness: 60, damping: 20, mass: 0.5 });

  // Map translate — small offsets create the "floating on water" drift
  const translateX = useTransform(smoothX, [-1, 1], [-40 * intensity, 40 * intensity]);
  const translateY = useTransform(smoothY, [-1, 1], [-30 * intensity, 30 * intensity]);

  // Subtle rotation — gives the "tilt on water" feel
  const rotateX = useTransform(smoothY, [-1, 1], [2 * intensity, -2 * intensity]);
  const rotateY = useTransform(smoothX, [-1, 1], [-2 * intensity, 2 * intensity]);

  useEffect(() => {
    setMounted(true);

    const handlePointerMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      mouseX.set(x);
      mouseY.set(y);
    };

    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const scrollX = window.scrollX || document.documentElement.scrollLeft;
      const maxScroll = Math.max(1, document.body.scrollHeight - window.innerHeight);
      const progress = Math.min(1, scrollY / maxScroll);
      mouseX.set((scrollX / window.innerWidth) * 2 - 1);
      mouseY.set(progress * 2 - 1);
    };

    const handleDeviceOrientation = (e) => {
      if (e.gamma == null || e.beta == null) return;
      const x = Math.max(-1, Math.min(1, e.gamma / 30));
      const y = Math.max(-1, Math.min(1, (e.beta - 45) / 30));
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("deviceorientation", handleDeviceOrientation);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("deviceorientation", handleDeviceOrientation);
    };
  }, [mouseX, mouseY]);

  if (!mounted) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
      aria-hidden
    >
      {/* The drifting map — behind the glass */}
      <motion.div
        className="absolute inset-0"
        style={{
          x: translateX,
          y: translateY,
          rotateX,
          rotateY,
          transformPerspective: 1200,
          scale: 1.35,
        }}
      >
        <WorldMap
          dotColor="rgba(22, 22, 29, 0.10)"
          activeColor="rgba(59, 123, 255, 0.35)"
          animateHotSpots={false}
        />
      </motion.div>

      {/* Glass frame — subtle vignette edges + light frosted overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(255,255,255,0) 0%, rgba(255,255,255,0.55) 70%, rgba(255,255,255,0.85) 100%)",
        }}
      />

      {/* Top + bottom fade — the "water surface" feel */}
      <div
        className="absolute inset-x-0 top-0 h-32 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, var(--bg) 0%, rgba(255,255,255,0) 100%)",
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-40 pointer-events-none"
        style={{
          background:
            "linear-gradient(0deg, var(--bg) 0%, rgba(255,255,255,0) 100%)",
        }}
      />

      {/* Subtle highlight sheen — top-left light source */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 40%)",
          mixBlendMode: "overlay",
        }}
      />
    </div>
  );
}
