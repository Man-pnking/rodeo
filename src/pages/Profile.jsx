import { useState, useRef } from "react";
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

export default function Profile() {
  const { user } = useAuth();
  const { profile, loading, update, refetch } = useProfile(user?.id);
  const { stats, loading: statsLoading } = useProfileStats(user?.id);
  const [tab, setTab] = useState("posts");
  const [editOpen, setEditOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const avatarInput = useRef(null);
  const bannerInput = useRef(null);

  const upload = async (file, bucket, column) => {
    if (!file || !user) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/${column}-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
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
    <div className="min-h-screen">
      <input
        ref={avatarInput}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && upload(e.target.files[0], "avatars", "avatar_url")}
      />
      <input
        ref={bannerInput}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && upload(e.target.files[0], "banners", "banner_url")}
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
          <p className="text-warm-dim text-sm mb-3">@{profile?.username || "you"}</p>
          <p className="text-body max-w-2xl">
            {profile?.bio || "Hey there! I am using Rodeo."}
          </p>
          {uploading && (
            <p className="text-xs text-iri-pink mt-3">Uploading...</p>
          )}
        </div>
      </SlideIn>

      <SlideIn variant="up" delay={0.15}>
        <ProfileStats stats={stats} loading={statsLoading} />
      </SlideIn>

      <ProfileTabs isOwn value={tab} onChange={setTab} />

      <div className="max-w-4xl mx-auto px-6 py-12">
        <SlideIn variant="up">
          {tab === "posts" && (
            <EmptyState title="No posts yet" body="Your posts and reposts will appear here." />
          )}
          {tab === "media" && (
            <EmptyState title="No media yet" body="Photos and videos you share will appear here." />
          )}
          {tab === "status" && (
            <EmptyState title="No status updates" body="Post a status to share a moment — disappears in 24 hours." />
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
