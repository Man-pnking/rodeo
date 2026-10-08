import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

/**
 * Wrap any element to give it a subtle global parallax effect.
 * speed > 0 → moves up slower than scroll (stays "behind")
 * speed < 0 → moves down (comes forward)
 */
export default function ParallaxLayer({
  children,
  speed = 0.15,
  className = "",
  as = "div",
}) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(
    scrollYProgress,
    [0, 1],
    [`${speed * 120}px`, `${-speed * 120}px`]
  );

  const MotionTag = motion[as] || motion.div;

  return (
    <MotionTag ref={ref} style={{ y }} className={className}>
      {children}
    </MotionTag>
  );
}
