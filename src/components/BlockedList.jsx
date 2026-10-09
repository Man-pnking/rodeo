import { Ban, X } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useBlocks } from "../hooks/useBlocks";
import { useToast } from "../context/ToastContext.jsx";
import { sounds } from "../lib/sounds";

export default function BlockedList() {
  const { user } = useAuth();
  const { blockedProfiles, loading, unblock } = useBlocks(user?.id);
  const { toast } = useToast();

  if (loading) {
    return <div className="text-warm-mute text-sm py-8 text-center">Loading...</div>;
  }

  if (blockedProfiles.length === 0) {
    return (
      <div className="text-center py-10">
        <Ban className="w-8 h-8 text-warm-mute mx-auto mb-3" />
        <p className="text-warm-mute text-sm">No blocked contacts.</p>
      </div>
    );
  }

  return (
    <div>
      {blockedProfiles.map((p) => (
        <div key={p.id} className="flex items-center gap-3 py-3 -mx-2 px-2">
          <div
            className="w-11 h-11 rounded-full shrink-0"
            style={{
              background: p.avatar_url
                ? `url(${p.avatar_url}) center/cover`
                : "linear-gradient(135deg, var(--brand) 0%, var(--violet) 100%)",
            }}
          />
          <div className="min-w-0 flex-1">
            <div className="text-warm font-medium text-sm truncate">
              {p.display_name || p.username}
            </div>
            <div className="text-xs text-warm-mute truncate">@{p.username}</div>
          </div>
          <button
            onClick={async () => {
              const { error } = await unblock(p.id);
              if (error) toast({ title: error, type: "error" });
              else {
                sounds.success();
                toast({ title: `Unblocked @${p.username}`, type: "success" });
              }
            }}
            className="btn-ghost text-xs px-4 py-2"
          >
            Unblock
          </button>
        </div>
      ))}
    </div>
  );
}
