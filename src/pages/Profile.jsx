import { useState, useRef } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import { useProfile } from "../hooks/useProfile";
import { useProfileStats } from "../hooks/useProfileStats";
import ProfileHeader from "../components/ProfileHeader.jsx";
import EditProfileModal from "../components/EditProfileModal.jsx";

export default function Profile() {
  const { user } = useAuth();
  const { profile, loading, update, refetch } = useProfile(user?.id);
  const { stats, loading: statsLoading } = useProfileStats(user?.id);
  const [uploading, setUploading] = useState(false);
  const avatarInput = useRef(null);
  const bannerInput = useRef(null);

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
        <div className="text-sm" style={{ color: "var(--text-tertiary)" }}>
          Loading profile...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
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
        stats={stats}
        statsLoading={statsLoading}
      />

      {uploading && (
        <p
          className="text-xs text-center mt-3"
          style={{ color: "var(--accent)" }}
        >
          Uploading...
        </p>
      )}

      <EditProfileModal
        open={false}
        profile={profile}
        onClose={() => {}}
        onSave={async (patch) => {
          await update(patch);
          await refetch();
        }}
      />
    </div>
  );
}
