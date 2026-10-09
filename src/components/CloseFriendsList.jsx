import { Star, Check, Plus } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useFriendships } from "../hooks/useFriendships";
import { useCloseFriends } from "../hooks/useCloseFriends";
import { useToast } from "../context/ToastContext.jsx";
import { sounds } from "../lib/sounds";

export default function CloseFriendsList() {
  const { user } = useAuth();
  const { friends, loading: friendsLoading } = useFriendships(user?.id);
  const { closeFriends, loading: cfLoading, isCloseFriend, add, remove } = useCloseFriends(user?.id);
  const { toast } = useToast();

  if (friendsLoading || cfLoading) {
    return <div className="text-warm-mute text-sm py-8 text-center">Loading...</div>;
  }

  if (friends.length === 0) {
    return (
      <div className="text-center py-10">
        <Star className="w-8 h-8 text-warm-mute mx-auto mb-3" />
        <p className="text-warm-mute text-sm">Add friends first to create a Close Friends list.</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs text-warm-mute mb-4">
        {closeFriends.length} close friend{closeFriends.length !== 1 ? "s" : ""} · statuses shared to this list stay private
      </p>
      {friends.map((f) => {
        const isCF = isCloseFriend(f.id);
        return (
          <button
            key={f.id}
            onClick={async () => {
              if (isCF) {
                const { error } = await remove(f.id);
                if (error) toast({ title: error, type: "error" });
                else sounds.tap();
              } else {
                const { error } = await add(f.id);
                if (error) toast({ title: error, type: "error" });
                else {
                  sounds.success();
                  toast({ title: `Added @${f.username}`, type: "success", duration: 1200 });
                }
              }
            }}
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
              <div className="text-warm font-medium text-sm truncate">
                {f.display_name || f.username}
              </div>
              <div className="text-xs text-warm-mute truncate">@{f.username}</div>
            </div>
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors"
              style={{
                background: isCF ? "linear-gradient(135deg, var(--brand) 0%, var(--violet) 100%)" : "rgba(255,255,255,0.08)",
                border: isCF ? "none" : "1px solid rgba(255,255,255,0.15)",
              }}
            >
              {isCF ? (
                <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
              ) : (
                <Plus className="w-3.5 h-3.5 text-warm-mute" strokeWidth={2.5} />
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
