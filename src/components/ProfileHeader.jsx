import { Camera, Settings as SettingsIcon, UserPlus, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import StatusRing from "./StatusRing.jsx";
import UserActionsMenu from "./UserActionsMenu.jsx";
import ReportModal from "./ReportModal.jsx";
import { MoreVertical } from "lucide-react";
import StatusViewer from "./StatusViewer.jsx";
import { useStatusContext } from "../context/StatusContext.jsx";
import ProfileStats from "./ProfileStats.jsx";
export default function ProfileHeader({
  profile,
  isOwn,
  onEditAvatar,
  onAddFriend,
  onMessage,
  isFriend,
  hasPendingRequest,
  stats,
  statsLoading,
}) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const { groups, getStatusFor, reload } = useStatusContext();
  const statusInfo = getStatusFor(profile?.id);
  const avatarUrl = profile?.avatar_url;

  return (
    <div className="relative">
      {/* Plain soft arch (no picture) */}
      <div
        className="relative w-full"
        style={{
          height: "140px",
          background: "var(--bg-soft)",
          borderRadius: "0 0 50% 50% / 0 0 100% 100%",
        }}
      />

      {/* Avatar + actions */}
      <div className="max-w-2xl mx-auto relative z-10 flex flex-col items-center px-6 pt-0 pb-6">
        <div className="relative -mt-16 mb-2 rounded-full" style={{ padding: "4px", background: "var(--bg)" }}>
          <StatusRing
            src={avatarUrl}
            size={96}
            ringWidth={statusInfo.hasStatus ? 4 : 0}
            gap={statusInfo.hasStatus ? 3 : 0}
            hasStatus={statusInfo.hasStatus}
            hasUnseen={statusInfo.hasUnseen}
            fallbackInitial={(profile?.display_name || profile?.username || "U")[0]}
            onClick={() => {
              if (statusInfo.hasStatus) setViewerOpen(true);
            }}
          />
          {isOwn && (
            <button
              onClick={onEditAvatar}
              className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors"
              style={{ background: "var(--violet)" }}
              aria-label="Edit avatar"
            >
              <Camera className="w-3 h-3 text-white" />
            </button>
          )}
        </div>
        {/* Identity block (name, handle, stats, bio, button) */}
        <div className="text-center mt-4 w-full max-w-lg mx-auto">
          <h1 className="text-[22px] sm:text-[26px] font-bold text-warm tracking-tight leading-tight">
            {profile?.display_name || "Your profile"}
          </h1>

          <div className="flex items-center justify-center gap-2 flex-wrap mt-2">
            <p className="text-warm-mute text-[13.5px]">
              @{profile?.username || "you"}
            </p>
          </div>

          {profile?.bio && (
            <p className="text-warm-mute text-[14px] leading-relaxed mt-3 max-w-md mx-auto">
              {profile.bio}
            </p>
          )}

                  </div>
        {/* Stats row */}
        {stats !== undefined && (
          <div className="w-full mt-5 pt-5" style={{ borderTop: "1px solid var(--border)" }}>
            <ProfileStats stats={stats} loading={statsLoading} />
          </div>
        )}




        <div className="flex items-center gap-2 pt-4">
          {isOwn ? (
            <Link
              to="/settings"
              className="btn-ghost flex items-center gap-2 text-sm"
            >
              <SettingsIcon className="w-4 h-4" />
              Settings
            </Link>
          ) : (
            <>
              <button onClick={onMessage} className="btn-ghost flex items-center gap-2 text-sm">
                <MessageCircle className="w-4 h-4" />
                Message
              </button>
              <button
                onClick={() => setActionsOpen(true)}
                className="p-3 rounded-full transition-colors hover:bg-white/5"
                aria-label="More actions"
              >
                <MoreVertical className="w-4 h-4 text-warm" />
              </button>
              {!isFriend && (
                <button
                  onClick={onAddFriend}
                  disabled={hasPendingRequest}
                  className="btn-primary flex items-center gap-2 text-sm"
                >
                  <UserPlus className="w-4 h-4" />
                  {hasPendingRequest ? "Requested" : "Add Friend"}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {profile && (
        <UserActionsMenu
          open={actionsOpen}
          onClose={() => setActionsOpen(false)}
          profile={profile}
          onOpenReport={() => setReportOpen(true)}
        />
      )}

      {profile && (
        <ReportModal
          open={reportOpen}
          onClose={() => setReportOpen(false)}
          targetType="user"
          targetId={profile.id}
        />
      )}

      {viewerOpen && statusInfo.group && (
        <StatusViewer
          groups={groups}
          startIndex={groups.indexOf(statusInfo.group)}
          onClose={() => {
            setViewerOpen(false);
            reload();
          }}
        />
      )}
    </div>
  );
}
