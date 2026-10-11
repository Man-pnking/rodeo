import { motion, AnimatePresence } from "framer-motion";
import { X, MessageCircle, UserPlus, Check, MapPin } from "lucide-react";

export default function PersonPreviewSheet({
  person,
  onClose,
  onMessage,
  onAdd,
  isFriend,
  isPending,
}) {
  return (
    <AnimatePresence>
      {person && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[80]"
            style={{
              background: "rgba(0,0,0,0.45)",
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
            }}
          />
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="fixed inset-x-0 bottom-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[380px] z-[81] rounded-t-3xl md:rounded-3xl"
            style={{
              background: "var(--bg)",
              border: "1px solid var(--border)",
              paddingBottom: "env(safe-area-inset-bottom, 0)",
            }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: "var(--bg-soft)", color: "var(--text-secondary)" }}
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="px-6 pt-8 pb-6 flex flex-col items-center text-center">
              <div
                className="w-24 h-24 rounded-full mb-4"
                style={{
                  background: person.avatar_url
                    ? `url(${person.avatar_url}) center/cover`
                    : "linear-gradient(135deg, var(--accent) 0%, var(--accent-strong) 100%)",
                }}
              />

              <div
                className="text-[20px] font-bold mb-0.5"
                style={{ color: "var(--text-primary)" }}
              >
                {person.display_name || person.username}
              </div>

              <div className="text-[14px] mb-3" style={{ color: "var(--text-tertiary)" }}>
                @{person.username}
              </div>

              {person.location_label && (
                <div
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] mb-4"
                  style={{ background: "var(--bg-soft)", color: "var(--text-secondary)" }}
                >
                  <MapPin className="w-3 h-3" />
                  {person.location_label}
                </div>
              )}

              {person.bio && (
                <p
                  className="text-[14px] leading-snug mb-6 max-w-[280px]"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {person.bio}
                </p>
              )}

              <div className="w-full flex gap-2">
                {isFriend ? (
                  <button
                    onClick={() => onMessage(person)}
                    className="flex-1 py-3 rounded-full font-semibold text-[14px] inline-flex items-center justify-center gap-2"
                    style={{ background: "var(--accent)", color: "var(--accent-fg)" }}
                  >
                    <MessageCircle className="w-4 h-4" />
                    Message
                  </button>
                ) : isPending ? (
                  <button
                    disabled
                    className="flex-1 py-3 rounded-full font-semibold text-[14px] inline-flex items-center justify-center gap-2 opacity-60"
                    style={{ background: "var(--bg-soft)", color: "var(--text-secondary)" }}
                  >
                    <Check className="w-4 h-4" />
                    Request sent
                  </button>
                ) : (
                  <button
                    onClick={() => onAdd(person)}
                    className="flex-1 py-3 rounded-full font-semibold text-[14px] inline-flex items-center justify-center gap-2"
                    style={{ background: "var(--accent)", color: "var(--accent-fg)" }}
                  >
                    <UserPlus className="w-4 h-4" />
                    Add friend
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
