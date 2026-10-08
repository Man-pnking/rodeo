import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useStatuses } from "../hooks/useStatuses";

const DURATION = 5000;

export default function StatusViewer({ groups, startIndex = 0, onClose }) {
  const { user } = useAuth();
  const { markViewed } = useStatuses(user?.id);
  const [groupIndex, setGroupIndex] = useState(startIndex);
  const [itemIndex, setItemIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const group = groups[groupIndex];
  const item = group?.items[itemIndex];

  useEffect(() => {
    if (!item) return;
    setProgress(0);
    markViewed(item.id, user?.id);

    const start = Date.now();
    const tick = setInterval(() => {
      const p = Math.min(100, ((Date.now() - start) / DURATION) * 100);
      setProgress(p);
      if (p >= 100) {
        clearInterval(tick);
        next();
      }
    }, 50);

    return () => clearInterval(tick);
  }, [item?.id]);

  const next = () => {
    if (!group) return;
    if (itemIndex < group.items.length - 1) {
      setItemIndex(itemIndex + 1);
    } else if (groupIndex < groups.length - 1) {
      setGroupIndex(groupIndex + 1);
      setItemIndex(0);
    } else {
      onClose();
    }
  };

  const prev = () => {
    if (itemIndex > 0) {
      setItemIndex(itemIndex - 1);
    } else if (groupIndex > 0) {
      setGroupIndex(groupIndex - 1);
      setItemIndex(0);
    }
  };

  if (!group || !item) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center"
        style={{ background: "#000" }}
      >
        {/* Progress bars */}
        <div className="absolute top-4 left-4 right-4 z-20 flex gap-1 safe-top">
          {group.items.map((_, i) => (
            <div
              key={i}
              className="flex-1 h-0.5 rounded-full overflow-hidden"
              style={{ background: "rgba(255,255,255,0.25)" }}
            >
              <div
                style={{
                  height: "100%",
                  width:
                    i < itemIndex ? "100%" : i === itemIndex ? `${progress}%` : "0%",
                  background: "#fff",
                  transition: "width 0.05s linear",
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-8 left-4 right-4 z-20 flex items-center justify-between safe-top mt-3">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full"
              style={{
                background: group.author?.avatar_url
                  ? `url(${group.author.avatar_url}) center/cover`
                  : "linear-gradient(135deg, #ff6ec7 0%, #a855f7 100%)",
              }}
            />
            <div>
              <div className="text-white text-sm font-medium">
                {group.author?.display_name || group.author?.username}
              </div>
              <div className="text-white/60 text-xs">
                {new Date(item.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.4)" }}
            aria-label="Close"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Image */}
        <motion.img
          key={item.id}
          src={item.image_url}
          alt=""
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="max-w-full max-h-full object-contain select-none"
        />

        {/* Caption */}
        {item.caption && (
          <div className="absolute bottom-24 left-6 right-6 z-20 text-center">
            <p className="text-white text-sm bg-black/40 backdrop-blur-md rounded-2xl px-4 py-3 inline-block">
              {item.caption}
            </p>
          </div>
        )}

        {/* Tap zones */}
        <button
          onClick={prev}
          className="absolute left-0 top-0 bottom-0 w-1/3 z-10"
          aria-label="Previous"
        />
        <button
          onClick={next}
          className="absolute right-0 top-0 bottom-0 w-1/3 z-10"
          aria-label="Next"
        />

        {/* Desktop arrows */}
        <button
          onClick={prev}
          className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full items-center justify-center z-20"
          style={{ background: "rgba(0,0,0,0.5)" }}
          aria-label="Previous"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <button
          onClick={next}
          className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full items-center justify-center z-20"
          style={{ background: "rgba(0,0,0,0.5)" }}
          aria-label="Next"
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
