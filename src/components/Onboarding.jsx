import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Camera, Car, ArrowRight } from "lucide-react";

const SLIDES = [
  {
    icon: MessageCircle,
    label: "01 — Connect",
    title: "Meet people nearby",
    body: "Find friends by phone, chat instantly, share moments. Rodeo brings your real connections into one place.",
    bullets: ["Phone-based friend discovery", "Real-time messaging", "Group conversations"],
    accent: "linear-gradient(135deg, var(--brand) 0%, var(--violet) 100%)",
    orbs: [
      { size: 420, top: "10%", left: "15%", color: "rgba(255,110,199,0.35)" },
      { size: 320, top: "55%", left: "60%", color: "rgba(168,85,247,0.30)" },
    ],
  },
  {
    icon: Camera,
    label: "02 — Share",
    title: "Post and share",
    body: "Stories, feed, and DMs — everything in one place. Share what matters, see what your circle is up to.",
    bullets: ["24-hour disappearing stories", "Likes, comments, replies", "Photo and video posts"],
    accent: "linear-gradient(135deg, var(--violet) 0%, #3b82f6 100%)",
    orbs: [
      { size: 440, top: "5%", left: "55%", color: "rgba(168,85,247,0.35)" },
      { size: 340, top: "60%", left: "10%", color: "rgba(59,130,246,0.30)" },
    ],
  },
  {
    icon: Car,
    label: "03 — Ride",
    title: "Ride together",
    body: "Book rides, split fares, travel with friends. From social to street — one app, no friction.",
    bullets: ["On-demand ride booking", "Split fares with friends", "Track rides in real time"],
    accent: "linear-gradient(135deg, #3b82f6 0%, #22d3ee 100%)",
    orbs: [
      { size: 420, top: "20%", left: "50%", color: "rgba(59,130,246,0.35)" },
      { size: 300, top: "60%", left: "5%", color: "rgba(34,211,238,0.30)" },
    ],
  },
];

export default function Onboarding({ onComplete }) {
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index];
  const Icon = slide.icon;
  const isLast = index === SLIDES.length - 1;

  const next = () => {
    if (isLast) onComplete();
    else setIndex((i) => i + 1);
  };

  const prev = () => {
    if (index > 0) setIndex((i) => i - 1);
  };

  const skip = () => onComplete();

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "Escape") skip();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index]);

  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col">
      {/* Ambient orbs — change color per slide */}
      <div className="absolute inset-0 pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0"
          >
            {slide.orbs.map((orb, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                animate={{
                  scale: [1, 1.1, 1],
                  x: [0, 20, 0],
                  y: [0, -20, 0],
                }}
                transition={{
                  duration: 14 + i * 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{
                  width: orb.size,
                  height: orb.size,
                  top: orb.top,
                  left: orb.left,
                  background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
                  filter: "blur(80px)",
                }}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Top bar — Skip */}
      <div className="relative z-10 flex justify-end p-6 safe-top">
        <button
          onClick={skip}
          className="text-warm-mute hover:text-warm text-sm transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex-1 grid md:grid-cols-2 items-center max-w-7xl mx-auto w-full px-6 md:px-12 gap-10 md:gap-16 pb-12">
        {/* Left — Visual */}
        <div className="hidden md:flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9, rotate: -4 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.95, rotate: 4 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              <div
                className="flex items-center justify-center"
                style={{
                  width: 280,
                  height: 280,
                  borderRadius: 64,
                  background: slide.accent,
                  boxShadow: "0 40px 120px rgba(168, 85, 247, 0.5)",
                }}
              >
                <Icon className="w-32 h-32 text-white" strokeWidth={1.2} />
              </div>

              {/* Orbiting dots */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0"
                style={{ padding: 40 }}
              >
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                      width: 8,
                      height: 8,
                      top: "50%",
                      left: "50%",
                      marginTop: -4,
                      marginLeft: -4,
                      background: "#fff",
                      boxShadow: "0 0 16px rgba(255,255,255,0.8)",
                      transform: `rotate(${i * 90}deg) translateY(-180px)`,
                    }}
                  />
                ))}
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right — Content */}
        <div className="flex flex-col justify-center">
          {/* Mobile icon */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`m-${index}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.6 }}
              className="md:hidden flex items-center justify-center mb-8"
            >
              <div
                className="flex items-center justify-center"
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 32,
                  background: slide.accent,
                  boxShadow: "0 20px 60px rgba(168, 85, 247, 0.4)",
                }}
              >
                <Icon className="w-14 h-14 text-white" strokeWidth={1.4} />
              </div>
            </motion.div>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="text-label mb-5">{slide.label}</div>

              <h1 className="display-xl mb-6 leading-[0.95]">
                <span className="gradient-text">{slide.title}</span>
              </h1>

              <p className="text-body text-lg mb-8 max-w-md">
                {slide.body}
              </p>

              <ul className="space-y-3 mb-10">
                {slide.bullets.map((b, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                    className="flex items-center gap-3 text-warm-dim"
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ background: "var(--brand)", boxShadow: "0 0 8px var(--brand)" }}
                    />
                    <span className="text-sm">{b}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </AnimatePresence>

          {/* Progress dots */}
          <div className="flex items-center gap-2 mb-8">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                className="transition-all rounded-full"
                style={{
                  width: i === index ? 32 : 8,
                  height: 8,
                  background:
                    i === index
                      ? "linear-gradient(90deg, var(--brand) 0%, var(--violet) 100%)"
                      : "rgba(255, 255, 255, 0.15)",
                }}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-4">
            <button
              onClick={next}
              className="btn-primary flex items-center justify-center gap-2 flex-1 md:flex-none md:px-10"
            >
              {isLast ? "Get started" : "Continue"}
              <ArrowRight className="w-4 h-4" />
            </button>

            {index > 0 && (
              <button
                onClick={prev}
                className="text-warm-mute hover:text-warm text-sm transition-colors px-4"
              >
                Back
              </button>
            )}
          </div>

          <div className="hidden md:block text-label mt-10">
            Use ← → to navigate · Esc to skip
          </div>
        </div>
      </div>
    </div>
  );
}
