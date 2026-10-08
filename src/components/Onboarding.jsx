import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Camera, Car, ArrowRight } from "lucide-react";

const SLIDES = [
  {
    icon: MessageCircle,
    title: "Meet people nearby",
    body: "Find friends by phone, chat instantly, share moments.",
    accent: "linear-gradient(120deg, #ff6ec7 0%, #a855f7 100%)",
  },
  {
    icon: Camera,
    title: "Post and share",
    body: "Stories, feed, and DMs — everything in one place.",
    accent: "linear-gradient(120deg, #a855f7 0%, #3b82f6 100%)",
  },
  {
    icon: Car,
    title: "Ride together",
    body: "Book rides, split fares, travel with friends.",
    accent: "linear-gradient(120deg, #3b82f6 0%, #22d3ee 100%)",
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

  const skip = () => onComplete();

  return (
    <div className="relative min-h-screen flex flex-col bg-transparent overflow-hidden">
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: "min(110vw, 800px)",
          height: "min(110vw, 800px)",
          top: "20%",
          left: "50%",
          marginLeft: "min(-55vw, -400px)",
          background: slide.accent,
          opacity: 0.18,
          filter: "blur(100px)",
          transition: "background 0.8s ease",
        }}
      />

      <div className="relative z-10 flex justify-end p-6 safe-top">
        <button
          onClick={skip}
          className="text-warm-mute hover:text-warm text-sm transition-colors"
        >
          Skip
        </button>
      </div>

      <div className="relative z-10 flex-1 flex items-center justify-center px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-center max-w-md w-full"
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="mx-auto mb-10 flex items-center justify-center"
              style={{
                width: 112,
                height: 112,
                borderRadius: 28,
                background: slide.accent,
                boxShadow: "0 20px 60px rgba(168, 85, 247, 0.4)",
              }}
            >
              <Icon className="w-12 h-12 text-white" strokeWidth={1.8} />
            </motion.div>

            <h1 className="display-lg mb-5 text-warm">
              {slide.title}
            </h1>
            <p className="text-body text-lg">
              {slide.body}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="relative z-10 px-8 pb-10 safe-bottom">
        <div className="flex justify-center gap-2 mb-10">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className="rounded-full transition-all"
              style={{
                width: i === index ? 28 : 8,
                height: 8,
                background:
                  i === index
                    ? "linear-gradient(90deg, #ff6ec7 0%, #a855f7 100%)"
                    : "rgba(255, 255, 255, 0.15)",
              }}
            />
          ))}
        </div>

        <button
          onClick={next}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {isLast ? "Get started" : "Next"}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
