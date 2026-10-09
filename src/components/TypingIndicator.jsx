import { motion } from "framer-motion";

export default function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="flex justify-start px-1 mb-1.5"
    >
      <div
        className="px-4 py-3 flex items-center gap-1"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.06) 100%)",
          backdropFilter: "blur(24px) saturate(160%)",
          WebkitBackdropFilter: "blur(24px) saturate(160%)",
          border: "1px solid rgba(255,255,255,0.09)",
          borderRadius: "22px 22px 22px 4px",
          boxShadow:
            "0 4px 16px rgba(0,0,0,0.20), 0 1px 0 rgba(255,255,255,0.05) inset",
        }}
      >
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="block w-1.5 h-1.5 rounded-full"
            style={{ background: "rgba(255,255,255,0.75)" }}
            animate={{
              y: [0, -4, 0],
              opacity: [0.4, 1, 0.4],
              scale: [0.85, 1.1, 0.85],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}
