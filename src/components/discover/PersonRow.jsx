import { motion } from "framer-motion";
import { Plus, Check, MessageCircle } from "lucide-react";

function formatDistance(km) {
  if (km == null || Number.isNaN(km)) return null;
  if (km < 1) return "< 1 km";
  if (km < 100) return `${Math.round(km)} km`;
  if (km < 1000) return `${Math.round(km)} km`;
  return `${Math.round(km / 1000).toLocaleString()}k km`;
}

export default function PersonRow({ person, onOpen, onMessage, onAdd, isFriend, isPending }) {
  const label = formatDistance(person.distance_km);
  const name = person.display_name || person.username || "Unknown";

  return (
    <motion.button
      whileTap={{ scale: 0.99 }}
      onClick={() => onOpen(person)}
      className="w-full flex items-center gap-3 py-2.5 px-1 rounded-2xl text-left transition-colors"
      style={{ color: "var(--text-primary)" }}
    >
      <div
        className="w-12 h-12 rounded-full shrink-0"
        style={{
          background: person.avatar_url
            ? `url(${person.avatar_url}) center/cover`
            : "linear-gradient(135deg, var(--accent) 0%, var(--accent-strong) 100%)",
        }}
      />

      <div className="min-w-0 flex-1">
        <div className="text-[15px] font-semibold truncate">{name}</div>
        <div className="flex items-center gap-2 text-[12.5px] truncate" style={{ color: "var(--text-tertiary)" }}>
          <span className="truncate">@{person.username}</span>
          {person.location_label && (
            <>
              <span>·</span>
              <span className="truncate">{person.location_label}</span>
            </>
          )}
          {label && (
            <>
              <span>·</span>
              <span style={{ color: "var(--accent)" }}>{label}</span>
            </>
          )}
        </div>
      </div>

      {isFriend ? (
        <button
          onClick={(e) => { e.stopPropagation(); onMessage(person); }}
          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
          style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
          aria-label="Message"
        >
          <MessageCircle className="w-4 h-4" strokeWidth={2.2} />
        </button>
      ) : isPending ? (
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
          style={{ background: "var(--bg-soft)", color: "var(--text-tertiary)" }}
          aria-label="Request sent"
        >
          <Check className="w-4 h-4" strokeWidth={2.4} />
        </div>
      ) : (
        <button
          onClick={(e) => { e.stopPropagation(); onAdd(person); }}
          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
          style={{ background: "var(--accent)", color: "var(--accent-fg)" }}
          aria-label="Add friend"
        >
          <Plus className="w-4 h-4" strokeWidth={2.6} />
        </button>
      )}
    </motion.button>
  );
}
