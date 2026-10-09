import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, UserPlus, LogOut, Trash2, Camera, X, Check } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useGroups } from "../hooks/useGroups";
import { useFriendships } from "../hooks/useFriendships";
import { useToast } from "../context/ToastContext.jsx";
import { sounds } from "../lib/sounds";
import GroupAvatar from "../components/GroupAvatar.jsx";
import MediaPicker from "../components/MediaPicker.jsx";
import { SettingsSection } from "../components/SettingsUI.jsx";
import SlideIn from "../components/SlideIn.jsx";

export default function GroupInfo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { groups, addMembers, removeMember, leaveGroup, updateGroup, deleteGroup } = useGroups(user?.id);
  const { friends } = useFriendships(user?.id);
  const { toast } = useToast();

  const [addOpen, setAddOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [nameEdit, setNameEdit] = useState(false);
  const [newName, setNewName] = useState("");

  const group = groups.find((g) => g.id === id);
  const isOwner = group?.created_by === user?.id;

  if (!group) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-8">
        <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-warm-mute">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <p className="text-warm-mute text-sm">Loading group...</p>
      </div>
    );
  }

  const memberIds = new Set(group.members?.map((m) => m.user_id));
  const addableFriends = friends.filter((f) => !memberIds.has(f.id));

  const handleLeave = async () => {
    if (!confirm("Leave this group?")) return;
    const { error } = await leaveGroup(group.id);
    if (error) toast({ title: error, type: "error" });
    else {
      toast({ title: "Left group", type: "info" });
      navigate("/messages");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this group for everyone? This cannot be undone.")) return;
    const { error } = await deleteGroup(group.id);
    if (error) toast({ title: error, type: "error" });
    else {
      toast({ title: "Group deleted", type: "info" });
      navigate("/messages");
    }
  };

  const saveName = async () => {
    if (!newName.trim()) return;
    await updateGroup(group.id, { name: newName.trim() });
    setNameEdit(false);
    sounds.success();
    toast({ title: "Name updated", type: "success" });
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 w-full">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 -m-2 rounded-full hover:bg-white/5" aria-label="Back">
          <ArrowLeft className="w-5 h-5 text-warm" />
        </button>
        <h1 className="display-lg">Group info</h1>
      </div>

      <SlideIn variant="up">
        <div className="flex flex-col items-center mb-10">
          <button
            onClick={() => isOwner && setPickerOpen(true)}
            className="relative mb-4"
            aria-label="Change avatar"
          >
            <GroupAvatar group={group} members={group.members} size={120} />
            {isOwner && (
              <div
                className="absolute bottom-1 right-1 w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: "var(--violet)", border: "3px solid var(--bg)" }}
              >
                <Camera className="w-4 h-4 text-white" />
              </div>
            )}
          </button>

          {nameEdit ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value.slice(0, 50))}
                autoFocus
                className="bg-transparent border-0 border-b border-white/20 focus:border-iri-pink text-center text-warm outline-none text-lg font-semibold"
              />
              <button onClick={saveName} className="p-2" aria-label="Save">
                <Check className="w-5 h-5 text-green-400" />
              </button>
              <button onClick={() => setNameEdit(false)} className="p-2" aria-label="Cancel">
                <X className="w-5 h-5 text-warm-mute" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                if (isOwner) {
                  setNewName(group.name);
                  setNameEdit(true);
                }
              }}
              className="display-md mb-1 text-warm"
            >
              {group.name}
            </button>
          )}
          <p className="text-xs text-warm-mute">
            {group.members?.length || 1} member{(group.members?.length || 1) !== 1 ? "s" : ""}
          </p>
        </div>
      </SlideIn>

      <SlideIn variant="up" delay={0.05}>
        <SettingsSection title="Members">
          {group.members?.map((m) => (
            <div key={m.user_id} className="flex items-center gap-3 py-3 -mx-2 px-2">
              <div
                className="w-11 h-11 rounded-full shrink-0"
                style={{
                  background: m.profile?.avatar_url
                    ? `url(${m.profile.avatar_url}) center/cover`
                    : "linear-gradient(135deg, var(--brand) 0%, var(--violet) 100%)",
                }}
              />
              <div className="min-w-0 flex-1">
                <div className="text-warm font-medium text-sm truncate">
                  {m.profile?.display_name || m.profile?.username}
                  {m.user_id === user?.id && " (you)"}
                </div>
                <div className="text-xs text-warm-mute">
                  {m.role === "owner" ? "Owner" : `@${m.profile?.username}`}
                </div>
              </div>
              {isOwner && m.user_id !== user?.id && (
                <button
                  onClick={async () => {
                    if (!confirm(`Remove ${m.profile?.username}?`)) return;
                    await removeMember(group.id, m.user_id);
                    toast({ title: "Member removed", type: "info" });
                  }}
                  className="p-2 -m-2" aria-label="Remove"
                >
                  <X className="w-4 h-4 text-warm-mute" />
                </button>
              )}
            </div>
          ))}

          {isOwner && (
            <button
              onClick={() => setAddOpen(true)}
              className="flex items-center gap-3 py-3 -mx-2 px-2 text-iri-pink hover:bg-white/[0.02] w-full rounded-xl text-left"
            >
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
                style={{ background: "rgba(168,85,247,0.15)" }}
              >
                <UserPlus className="w-5 h-5 text-iri-pink" />
              </div>
              <span className="text-sm font-medium">Add members</span>
            </button>
          )}
        </SettingsSection>
      </SlideIn>

      <SlideIn variant="up" delay={0.1}>
        <div className="mt-10 space-y-3">
          <button
            onClick={handleLeave}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
          >
            <LogOut className="w-4 h-4" /> Leave group
          </button>
          {isOwner && (
            <button
              onClick={handleDelete}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl"
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}
            >
              <Trash2 className="w-4 h-4" /> Delete group
            </button>
          )}
        </div>
      </SlideIn>

      {/* Add members sheet */}
      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center md:justify-center" style={{ background: "rgba(0,0,0,0.75)" }} onClick={() => setAddOpen(false)}>
          <div className="w-full md:max-w-md rounded-t-3xl md:rounded-3xl p-6 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            style={{ background: "var(--bg-soft)" }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="display-md">Add members</h3>
              <button onClick={() => setAddOpen(false)} className="p-2 -m-2">
                <X className="w-5 h-5 text-warm-mute" />
              </button>
            </div>
            {addableFriends.length === 0 && (
              <p className="text-warm-mute text-sm text-center py-8">No friends to add.</p>
            )}
            {addableFriends.map((f) => (
              <button
                key={f.id}
                onClick={async () => {
                  await addMembers(group.id, [f.id]);
                  toast({ title: `${f.username} added`, type: "success" });
                  setAddOpen(false);
                }}
                className="w-full flex items-center gap-3 py-3 hover:bg-white/[0.03] rounded-xl px-2 text-left"
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
              </button>
            ))}
          </div>
        </div>
      )}

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={async (m) => {
          const media = Array.isArray(m) ? m[0] : m;
          await updateGroup(group.id, { avatar_url: media.url });
          toast({ title: "Group avatar updated", type: "success" });
        }}
      />
    </div>
  );
}
