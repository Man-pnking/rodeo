import { Link } from "react-router-dom";
import { ArrowLeft, Phone } from "lucide-react";
import GroupAvatar from "../GroupAvatar.jsx";

export default function ConversationHeader({ kind, other, group, onBack }) {
  return (
    <header
      className="relative flex items-center justify-between px-3 py-2 shrink-0 z-10"
      style={{
        paddingTop: "calc(env(safe-area-inset-top, 0) + 10px)",
        borderBottom: "1px solid var(--border)",
        background: "var(--bg)",
      }}
    >
      <button
        onClick={onBack}
        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors"
        style={{ color: "var(--text-primary)" }}
        aria-label="Back"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2.5 max-w-[60%]">
        {kind === "group" && group ? (
          <Link to={`/group/${group.id}`} className="flex items-center gap-2.5 min-w-0">
            <GroupAvatar group={group} members={group.members} size={36} />
            <div className="min-w-0 text-left">
              <div className="text-[15px] font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                {group.name || "Group"}
              </div>
              <div className="text-[11.5px] truncate" style={{ color: "var(--text-tertiary)" }}>
                {group.members?.length || 1} member{(group.members?.length || 1) !== 1 ? "s" : ""}
              </div>
            </div>
          </Link>
        ) : kind === "dm" && other ? (
          <Link to={`/u/${other.username}`} className="flex items-center gap-2.5 min-w-0">
            <div className="relative shrink-0">
              <div
                className="w-9 h-9 rounded-full"
                style={{
                  background: other.avatar_url
                    ? `url(${other.avatar_url}) center/cover`
                    : "linear-gradient(135deg, var(--accent) 0%, var(--accent-strong) 100%)",
                }}
              />
              <span
                className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full"
                style={{ background: "var(--success)", border: "2px solid var(--bg)" }}
              />
            </div>
            <div className="min-w-0 text-left">
              <div className="text-[15px] font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                {other.display_name || other.username || "Chat"}
              </div>
              <div className="text-[11.5px] truncate" style={{ color: "var(--accent)" }}>
                Active now
              </div>
            </div>
          </Link>
        ) : (
          <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Loading…
          </div>
        )}
      </div>

      <button
        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors"
        style={{ color: "var(--text-primary)" }}
        aria-label="Call"
      >
        <Phone className="w-[18px] h-[18px]" strokeWidth={1.9} />
      </button>
    </header>
  );
}
