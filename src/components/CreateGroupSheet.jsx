import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Search, Camera } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useFriendships } from "../hooks/useFriendships";
import { useGroups } from "../hooks/useGroups";
import { useToast } from "../context/ToastContext.jsx";
import { sounds } from "../lib/sounds";
import MediaPicker from "./MediaPicker.jsx";

export default function CreateGroupSheet({ open, onClose, onCreated }) {
  const { user } = useAuth();
  const { friends, loading } = useFriendships(user?.id);
  const { createGroup } = useGroups(user?.id);
  const { updateGroup } = useGroups(user?.id);
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [selected, setSelected] = useState(new Set());
  const [avatar, setAvatar] = useState(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = friends.filter((f) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      (f.username || "").toLowerCase().includes(q) ||
      (f.display_name || "").toLowerCase().includes(q)
    );
  });

  const toggle = (id) => {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const submit = async () => {
    if (!name.trim() || selected.size === 0) return;
    setCreating(true);
    const { id, error } = await createGroup(name.trim(), Array.from(selected));
    if (error) {
      toast({ title: error, type: "error" });
      sounds.error();
      setCreating(false);
      return;
    }
    if (avatar?.url) {
      await updateGroup(id, { avatar_url: avatar.url });
    }
    sounds.success();
    toast({ title: "Group created", type: "success" });
    setCreating(false);
    setName("");
    setSelected(new Set());
    setAvatar(null);
    onClose();
    onCreated?.(id);
  };

  const reset = () => {
    setName("");
    setSelected(new Set());
    setAvatar(null);
    onClose();
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50" style={{ background: "rgba(0,0,0,0.75)" }} onClick={reset} />
            <motion.div
              initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-x-0 bottom-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md z-50 rounded-t-3xl md:rounded-3xl safe-bottom"
              style={{ background: "var(--bg-soft)", border: "1px solid var(--border)", maxHeight: "92vh", display: "flex", flexDirection: "column" }}
            >
              <div className="flex items-center justify-between px-6 py-5" style={{ flexShrink: 0 }}>
                <h2 className="display-md">New group</h2>
                <button onClick={reset} className="p-2 -m-2" aria-label="Close">
                  <X className="w-5 h-5 text-warm-mute" />
                </button>
              </div>

              <div className="px-6 pb-4 flex items-center gap-4" style={{ flexShrink: 0 }}>
                <button
                  onClick={() => setPickerOpen(true)}
                  className="w-16 h-16 rounded-full flex items-center justify-center shrink-0 overflow-hidden"
                  style={{
                    background: avatar?.url
                      ? `url(${avatar.url}) center/cover`
                      : "linear-gradient(135deg, var(--brand) 0%, var(--violet) 100%)",
                  }}
                  aria-label="Group avatar"
                >
                  {!avatar && <Camera className="w-6 h-6 text-white" />}
                </button>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value.slice(0, 50))}
                  placeholder="Group name"
                  autoFocus
                  className="flex-1 bg-transparent border-0 border-b border-white/15 focus:border-iri-pink pb-2 text-warm placeholder:text-warm-mute outline-none text-base"
                />
              </div>

              <div className="px-6 pb-4" style={{ flexShrink: 0 }}>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-warm-mute pointer-events-none" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search friends..."
                    className="w-full bg-transparent border-0 border-b border-white/15 focus:border-iri-pink pl-9 pb-3 text-warm placeholder:text-warm-mute outline-none text-sm"
                  />
                </div>
                <div className="text-xs text-warm-mute mt-3">
                  {selected.size} selected
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-6 pb-4" style={{ minHeight: 0 }}>
                {loading && <div className="text-warm-mute text-sm py-6 text-center">Loading...</div>}
                {!loading && filtered.length === 0 && (
                  <div className="text-center py-10 text-warm-mute text-sm">
                    {query ? "No matches." : "Add friends first to create a group."}
                  </div>
                )}
                {filtered.map((f) => {
                  const isSelected = selected.has(f.id);
                  return (
                    <button
                      key={f.id}
                      onClick={() => toggle(f.id)}
                      className="w-full flex items-center gap-3 py-3 hover:bg-white/[0.03] transition-colors -mx-2 px-2 rounded-xl text-left"
                    >
                      <div
                        className="w-11 h-11 rounded-full shrink-0"
                        style={{
                          background: f.avatar_url
                            ? `url(${f.avatar_url}) center/cover`
                            : "linear-gradient(135deg, var(--brand) 0%, var(--violet) 100%)",
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-warm font-medium text-sm truncate">{f.display_name || f.username}</div>
                        <div className="text-xs text-warm-mute truncate">@{f.username}</div>
                      </div>
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors"
                        style={{
                          background: isSelected ? "linear-gradient(135deg, var(--brand) 0%, var(--violet) 100%)" : "rgba(255,255,255,0.08)",
                          border: isSelected ? "none" : "1px solid rgba(255,255,255,0.15)",
                        }}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="px-6 py-4" style={{ flexShrink: 0, borderTop: "1px solid var(--border)" }}>
                <button
                  onClick={submit}
                  disabled={creating || !name.trim() || selected.size === 0}
                  className="btn-primary w-full"
                >
                  {creating ? "Creating..." : `Create group (${selected.size + 1})`}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={(m) => setAvatar(Array.isArray(m) ? m[0] : m)}
      />
    </>
  );
}
