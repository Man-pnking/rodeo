import { useState, useRef, useEffect, useCallback } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import { useProfile } from "../hooks/useProfile";
import { useProfileStats } from "../hooks/useProfileStats";
import ProfileHeader from "../components/ProfileHeader.jsx";
import ProfileStats from "../components/ProfileStats.jsx";
import ProfileTabs from "../components/ProfileTabs.jsx";
import EditProfileModal from "../components/EditProfileModal.jsx";
import SavedTab from "../components/SavedTab.jsx";
import SlideIn from "../components/SlideIn.jsx";
import PostGrid from "../components/PostGrid.jsx";
import Composer from "../components/Composer.jsx";

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { profile, loading, update, refetch } = useProfile(user?.id);
  const { stats, loading: statsLoading } = useProfileStats(user?.id);
  const [tab, setTab] = useState("posts");
  const [editOpen, setEditOpen] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [myPosts, setMyPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const avatarInput = useRef(null);
  const bannerInput = useRef(null);

  const loadMyPosts = useCallback(async () => {
    if (!user?.id) return;
    setPostsLoading(true);
    const { data } = await supabase
      .from("posts")
      .select(`
        id, author_id, body, image_url, likes_count, comments_count, created_at,
        author:profiles!posts_author_id_fkey (id, username, display_name, avatar_url)
      `)
      .eq("author_id", user.id)
      .order("created_at", { ascending: false });
    setMyPosts(data || []);
    setPostsLoading(false);
  }, [user?.id]);

  useEffect(() => {
    loadMyPosts();
  }, [loadMyPosts]);

  const upload = async (file, bucket, column) => {
    if (!file || !user) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/${column}-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: true });
    if (upErr) {
      alert(upErr.message);
      setUploading(false);
      return;
    }
    const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
    await update({ [column]: pub.publicUrl });
    await refetch();
    setUploading(false);
  };

  const onPickAvatar = () => avatarInput.current?.click();
  const onPickBanner = () => bannerInput.current?.click();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-warm-mute text-sm">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="pb-4">
      <input
        ref={avatarInput}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) =>
          e.target.files?.[0] && upload(e.target.files[0], "avatars", "avatar_url")
        }
      />
      <input
        ref={bannerInput}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) =>
          e.target.files?.[0] && upload(e.target.files[0], "banners", "banner_url")
        }
      />

      <ProfileHeader
        profile={profile}
        isOwn
        onEditAvatar={onPickAvatar}
        onEditBanner={onPickBanner}
      />

      <SlideIn variant="up" delay={0.1}>
        <div className="max-w-4xl mx-auto px-6 pt-6 pb-4">
          <h1 className="display-md mb-1">
            {profile?.display_name || "Your profile"}
          </h1>
          <div className="flex items-center gap-3 flex-wrap mb-3">
            <p className="text-warm-dim text-sm">
              @{profile?.username || "you"}
            </p>
            <ProfileStats stats={stats} loading={statsLoading} />
          </div>
          <p className="text-body max-w-2xl mb-5">
            {profile?.bio || "Hey there! I am using Rodeo."}
          </p>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setComposerOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold"
            style={{
              background: "linear-gradient(135deg, var(--brand) 0%, var(--violet) 100%)",
              color: "#fff",
              boxShadow: "0 4px 16px rgba(251, 113, 133, 0.30)",
            }}
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            New Post
          </motion.button>

          {uploading && (
            <p className="text-xs text-iri-pink mt-3">Uploading...</p>
          )}
        </div>
      </SlideIn>

      <ProfileTabs isOwn value={tab} onChange={setTab} />

      <div className="w-full">
        <SlideIn variant="up">
          {tab === "posts" && (
            <>
              {postsLoading && (
                <div className="text-center py-6 text-warm-mute text-sm">
                  Loading posts...
                </div>
              )}
              {!postsLoading && myPosts.length === 0 && (
                <EmptyState
                  title="No posts yet"
                  body="Tap “New Post” to share something."
                />
              )}
              {!postsLoading && myPosts.length > 0 && (
                <PostGrid
                  posts={myPosts}
                  onOpenPost={(post) => navigate(`/post/${post.id}`)}
                />
              )}
            </>
          )}
          {tab === "media" && (
            <PostGrid
                posts={myPosts.filter((p) => !!p.image_url)}
                onOpenPost={(post) => navigate(`/post/${post.id}`)}
              />
          )}
          {tab === "status" && (
            <EmptyState
              title="No status updates"
              body="Post a status to share a moment — disappears in 24 hours."
            />
          )}
          {tab === "saved" && <SavedTab />}
        </SlideIn>
      </div>

      <EditProfileModal
        open={editOpen}
        profile={profile}
        onClose={() => setEditOpen(false)}
        onSave={async (patch) => {
          await update(patch);
          await refetch();
        }}
      />

      <Composer
        open={composerOpen}
        onClose={() => setComposerOpen(false)}
        onPosted={() => {
          loadMyPosts();
        }}
      />
    </div>
  );
}

function EmptyState({ title, body }) {
  return (
    <div className="text-center py-16">
      <h3 className="display-md mb-2 text-warm">{title}</h3>
      <p className="text-body">{body}</p>
    </div>
  );
}
