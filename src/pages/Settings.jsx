import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, User as UserIcon, UserCog, Image as ImageIcon,
  Lock, Bell, Database, MessageSquare, Palette, Info, LogOut,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import { useProfile } from "../hooks/useProfile";
import SlideIn from "../components/SlideIn.jsx";
import { SettingsRow } from "../components/SettingsUI.jsx";
import EditProfileModal from "../components/EditProfileModal.jsx";

export default function Settings() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { profile, update, refetch } = useProfile(user?.id);
  const [editOpen, setEditOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const avatarInput = useRef(null);
  const bannerInput = useRef(null);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

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

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 w-full">
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

      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -m-2 rounded-full transition-colors"
          style={{ color: "var(--text-primary)" }}
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-[28px] font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
          Settings
        </h1>
      </div>

      <SlideIn variant="up">
        <button
          onClick={() => navigate("/profile")}
          className="w-full flex items-center gap-4 py-4 mb-6 -mx-2 px-2 rounded-xl transition-colors"
        >
          <div
            className="w-14 h-14 rounded-full shrink-0"
            style={{
              background: profile?.avatar_url
                ? `url(${profile.avatar_url}) center/cover`
                : "linear-gradient(135deg, var(--brand) 0%, var(--violet) 100%)",
            }}
          />
          <div className="min-w-0 flex-1 text-left">
            <div className="font-semibold truncate" style={{ color: "var(--text-primary)" }}>
              {profile?.display_name || profile?.username || "Your profile"}
            </div>
            <div className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>
              {user?.email}
            </div>
          </div>
        </button>
      </SlideIn>

      {/* Profile editing */}
      <SlideIn variant="up" delay={0.03}>
        <div className="mb-6">
          <SettingsRow
            icon={UserCog}
            label="Edit Profile"
            subtitle="Name, username, bio"
            onClick={() => setEditOpen(true)}
          />
          <SettingsRow
            icon={ImageIcon}
            label="Profile Photo"
            subtitle={uploading ? "Uploading..." : "Change your avatar"}
            onClick={() => !uploading && avatarInput.current?.click()}
          />
          <SettingsRow
            icon={ImageIcon}
            label="Banner Image"
            subtitle="Change your profile banner"
            onClick={() => !uploading && bannerInput.current?.click()}
          />
        </div>
      </SlideIn>

      <SlideIn variant="up" delay={0.05}>
        <div className="mb-6">
          <SettingsRow
            icon={UserIcon}
            label="Account"
            subtitle="Security, email, delete account"
            onClick={() => navigate("/settings/account")}
          />
          <SettingsRow
            icon={Lock}
            label="Privacy"
            subtitle="Visibility, blocked contacts"
            onClick={() => navigate("/settings/privacy")}
          />
          <SettingsRow
            icon={Bell}
            label="Notifications"
            subtitle="Sounds, alerts, previews"
            onClick={() => navigate("/settings/notifications")}
          />
          <SettingsRow
            icon={Database}
            label="Storage and data"
            subtitle="Network, downloads, cache"
            onClick={() => navigate("/settings/storage")}
          />
          <SettingsRow
            icon={MessageSquare}
            label="Chat"
            subtitle="Wallpaper, font size, enter to send"
            onClick={() => navigate("/settings/chat")}
          />
          <SettingsRow
            icon={Palette}
            label="Appearance"
            subtitle="Theme, accent color"
            onClick={() => navigate("/settings/appearance")}
          />
          <SettingsRow
            icon={Info}
            label="General"
            subtitle="Language, help, about"
            onClick={() => navigate("/settings/general")}
          />
        </div>
      </SlideIn>

      <SlideIn variant="up" delay={0.1}>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl transition-colors"
          style={{
            background: "rgba(239, 68, 68, 0.08)",
            border: "1px solid rgba(239, 68, 68, 0.2)",
            color: "#ef4444",
          }}
        >
          <LogOut className="w-4 h-4" />
          <span className="font-medium">Sign out</span>
        </button>
      </SlideIn>

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
