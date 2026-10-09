import { motion } from "framer-motion";

function labelForDate(iso) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const sameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (sameDay(d, today)) return "Today";
  if (sameDay(d, yesterday)) return "Yesterday";

  return d.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: d.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
  });
}

export default function DateSeparator({ date }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      className="flex items-center justify-center my-5"
    >
      <div
        className="px-3.5 py-1.5 rounded-full text-[11px] font-semibold tracking-wide uppercase"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%)",
          border: "1px solid rgba(255,255,255,0.10)",
          color: "rgba(255,255,255,0.65)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          letterSpacing: "0.06em",
        }}
      >
        {labelForDate(date)}
      </div>
    </motion.div>
  );
}
