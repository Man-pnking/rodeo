import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MoreHorizontal,
  MessageCircle,
  Image as ImageIcon,
  Flag,
  ChevronRight,
  UserPlus,
  Clock,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useProfile } from "../hooks/useProfile";
import { useProfileStats } from "../hooks/useProfileStats";
import { useAuth } from "../hooks/useAuth";
import { useConversations } from "../hooks/useConversations";
import { useFriendships } from "../hooks/useFriendships";
import ReportModal from "../components/ReportModal.jsx";
import SlideIn from "../components/SlideIn.jsx";
import PostGrid from "../components/PostGrid.jsx";

export default function UserProfile() {
  const { username } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { getOrCreate } = useConversations(user?.id);
  const [startingChat, setStartingChat] = useState(false);
  const [resolvedId, setResolvedId] = useState(null);
  const [lookupDone, setLookupDone] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);

  const { isFriend, pendingTo, sendRequest } = useFriendships(user?.id || null);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) {
          setResolvedId(data?.id || null);
          setLookupDone(true);
        }
      });
    return () => { cancelled = true; };
  }, [username]);

  const { profile, loading } = useProfile(resolvedId);
  const { stats, loading: statsLoading } = useProfileStats(resolvedId);

  useEffect(() => {
    if (!resolvedId) return;
    setPostsLoading(true);
    supabase
      .from("posts")
      .select(`
        id, author_id, body, image_url, likes_count, comments_count, created_at,
        author:profiles!posts_author_id_fkey (id, username, display_name, avatar_url)
      `)
      .eq("author_id", resolvedId)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setPosts(data || []);
        setPostsLoading(false);
      });
  }, [resolvedId]);

  if (!lookupDone || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-warm-mute text-sm">Loading...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center px-6">
          <h1 className="display-md mb-2">User not found</h1>
          <p className="text-body">@{username} doesn't exist or was deleted.</p>
        </div>
      </div>
    );
  }

  const isOwn = profile.id === user?.id;
  const friends = isFriend?.(profile.id) || false;
  const pending = pendingTo?.(profile.id) || false;
  const displayName = profile.display_name || profile.username;

  const startChat = async () => {
    if (startingChat) return;
    setStartingChat(true);
    const { id, error } = await getOrCreate(profile.id);
    setStartingChat(false);
    if (error) { alert(error); return; }
    navigate(`/messages/${id}`);
  };

  const addFriend = async () => {
    if (!user) return;
    const { error } = await sendRequest(profile.id);
    if (error) alert(error);
  };

  return (
    <div className="min-h-screen pb-24" style={{ background: "var(--bg)" }}>
      <div
        className="sticky top-0 z-20 flex items-center justify-between px-4 py-3"
        style={{
          background: "var(--bg)",
          paddingTop: "calc(env(safe-area-inset-top, 0) + 12px)",
        }}
      >
        <button
          onClick={() => navigate(-1)}
          className="p-2 -m-2 rounded-full"
          style={{ color: "var(--text-primary)" }}
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => setReportOpen(true)}
          className="p-2 -m-2 rounded-full"
          style={{ color: "var(--text-primary)" }}
          aria-label="More"
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      <div className="relative max-w-md mx-auto px-5">
        <div
          className="absolute left-0 right-0 top-0 mx-auto pointer-events-none"
          style={{
            width: "100%",
            height: "160px",
            background: "var(--bg-soft)",
            borderRadius: "0 0 160px 160px",
          }}
        />

        <div className="relative flex justify-end pr-2 pt-2">
          <div
            className="w-20 h-20 rounded-full overflow-hidden"
            style={{
              background: profile.avatar_url
                ? `url(${profile.avatar_url}) center/cover`
                : "linear-gradient(135deg, var(--accent) 0%, var(--accent-strong) 100%)",
              border: "3px solid var(--bg)",
              boxShadow: "var(--shadow-md)",
            }}
          />
        </div>

        <SlideIn variant="up">
          <div className="relative mt-5">
            <h1
              className="text-[26px] font-bold tracking-tight leading-tight"
              style={{ color: "var(--text-primary)" }}
            >
              {displayName}
            </h1>
            <p className="text-[13.5px] mt-1" style={{ color: "var(--text-tertiary)" }}>
              {profile.bio || "Hope we happy everyday"}
            </p>
          </div>
        </SlideIn>

        <SlideIn variant="up" delay={0.05}>
          <div
            className="grid grid-cols-3 mt-6 py-4"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            <StatCell value={posts.length} label="Posts" divider={false} loading={postsLoading} />
            <StatCell value={stats?.followers ?? 0} label="Followers" divider loading={statsLoading} />
            <StatCell value={stats?.likes ?? 0} label="Likes" divider loading={statsLoading} />
          </div>
        </SlideIn>
      </div>

      <div className="max-w-md mx-auto px-5 mt-2">
        <RowButton
          icon={MessageCircle}
          iconBg="var(--accent)"
          label="Message"
          onClick={startChat}
          disabled={startingChat}
        />
        <RowButton
          icon={ImageIcon}
          iconBg="var(--accent)"
          label="View Posts"
          onClick={() => {
            document.getElementById("user-posts")?.scrollIntoView({ behavior: "smooth" });
          }}
        />
        <RowButton
          icon={Flag}
          iconBg="var(--pink)"
          label="Report"
          onClick={() => setReportOpen(true)}
          danger
        />
      </div>

      <div className="max-w-md mx-auto px-5 mt-8">
        {isOwn ? (
          <button
            onClick={() => navigate("/profile")}
            className="w-full py-4 rounded-full font-semibold text-[15px]"
            style={{
              background: "var(--accent)",
              color: "var(--accent-fg)",
              boxShadow: "0 4px 16px rgba(59, 123, 255, 0.30)",
            }}
          >
            View my profile
          </button>
        ) : friends ? (
          <button
            onClick={startChat}
            disabled={startingChat}
            className="w-full py-4 rounded-full font-semibold text-[15px] flex items-center justify-center gap-2"
            style={{
              background: "var(--accent)",
              color: "var(--accent-fg)",
              boxShadow: "0 4px 16px rgba(59, 123, 255, 0.30)",
            }}
          >
            <MessageCircle className="w-4 h-4" />
            Message
          </button>
        ) : pending ? (
          <button
            disabled
            className="w-full py-4 rounded-full font-semibold text-[15px] flex items-center justify-center gap-2"
            style={{
              background: "var(--bg-soft)",
              color: "var(--text-secondary)",
            }}
          >
            <Clock className="w-4 h-4" />
            Request sent
          </button>
        ) : (
          <button
            onClick={addFriend}
            className="w-full py-4 rounded-full font-semibold text-[15px] flex items-center justify-center gap-2"
            style={{
              background: "var(--accent)",
              color: "var(--accent-fg)",
              boxShadow: "0 4px 16px rgba(59, 123, 255, 0.30)",
            }}
          >
            <UserPlus className="w-4 h-4" />
            Add friend
          </button>
        )}
      </div>

      <div id="user-posts" className="max-w-md mx-auto px-1 mt-10">
        {postsLoading && (
          <div className="text-center py-8 text-warm-mute text-sm">Loading posts...</div>
        )}
        {!postsLoading && posts.length === 0 && (
          <div className="text-center py-12 text-warm-mute text-sm">
            No posts yet.
          </div>
        )}
        {!postsLoading && posts.length > 0 && (
          <PostGrid posts={posts} onOpenPost={(p) => navigate(`/post/${p.id}`)} />
        )}
      </div>

      <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        targetType="user"
        targetId={profile.id}
      />
    </div>
  );
}

function StatCell({ value, label, divider, loading }) {
  return (
    <div
      className="text-center"
      style={{
        borderLeft: divider ? "1px solid var(--border)" : "none",
      }}
    >
      <div
        className="text-[22px] font-bold tabular-nums leading-none"
        style={{ color: "var(--text-primary)" }}
      >
        {loading ? "—" : formatCount(value)}
      </div>
      <div
        className="text-[11.5px] mt-1.5"
        style={{ color: "var(--text-tertiary)" }}
      >
        {label}
      </div>
    </div>
  );
}

function RowButton({ icon: Icon, iconBg, label, onClick, disabled, danger }) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center gap-4 py-3.5 px-2 rounded-2xl disabled:opacity-50"
      style={{ color: "var(--text-primary)" }}
    >
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
        style={{ background: iconBg }}
      >
        <Icon className="w-4 h-4 text-white" strokeWidth={2.2} />
      </div>
      <span
        className="flex-1 text-left text-[15px] font-medium"
        style={{ color: danger ? "var(--danger)" : "var(--text-primary)" }}
      >
        {label}
      </span>
      <ChevronRight className="w-4 h-4" style={{ color: "var(--text-tertiary)" }} />
    </motion.button>
  );
}

function formatCount(n) {
  if (n === 0 || n == null) return "0";
  if (n < 1000) return String(n);
  if (n < 10000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  if (n < 1000000) return Math.round(n / 1000) + "k";
  return (n / 1000000).toFixed(1).replace(/\.0$/, "") + "m";
}
