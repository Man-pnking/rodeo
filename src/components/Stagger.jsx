import { motion } from "framer-motion";

export default function Stagger({
  children,
  stagger = 0.06,
  delay = 0,
  once = true,
  className = "",
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: 0.1 }}
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: stagger, delayChildren: delay },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, variant = "up", className = "" }) {
  const v = {
    up:    { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } },
    down:  { hidden: { opacity: 0, y: -16 }, visible: { opacity: 1, y: 0 } },
    left:  { hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } },
    right: { hidden: { opacity: 0, x: 20 },  visible: { opacity: 1, x: 0 } },
    fade:  { hidden: { opacity: 0 },         visible: { opacity: 1 } },
  }[variant] || { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };

  return (
    <motion.div variants={v} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className={className}>
      {children}
    </motion.div>
  );
}
