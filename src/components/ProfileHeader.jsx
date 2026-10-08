import { Camera, Settings as SettingsIcon, UserPlus, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import ParallaxLayer from "./ParallaxLayer.jsx";
import { useState } from "react";
import StatusRing from "./StatusRing.jsx";
import StatusViewer from "./StatusViewer.jsx";
import { useStatusContext } from "../context/StatusContext.jsx";

export default function ProfileHeader({
  profile,
  isOwn,
  onEditAvatar,
  onEditBanner,
  onAddFriend,
  onMessage,
  isFriend,
  hasPendingRequest,
}) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const { groups, getStatusFor, reload } = useStatusContext();
  const statusInfo = getStatusFor(profile?.id);
  const avatarUrl = profile?.avatar_url;
  const bannerUrl = profile?.banner_url;

  return (
    <div className="relative">
      {/* Banner */}
      <ParallaxLayer speed={0.25} className="relative w-full h-48 sm:h-64 md:h-80 overflow-hidden" style={{
        background: bannerUrl ? `url(${bannerUrl}) center/cover` : "linear-gradient(135deg, #ff6ec7 0%, #a855f7 50%, #3b82f6 100%)",
      }}>
        {isOwn && (
          <button
            onClick={onEditBanner}
            className="absolute top-4 right-4 p-2 rounded-full transition-colors"
            style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(12px)" }}
            aria-label="Edit banner"
          >
            <Camera className="w-4 h-4 text-white" />
          </button>
        )}
      </ParallaxLayer>

      {/* Avatar + actions */}
      <div className="max-w-4xl mx-auto px-6 -mt-16 sm:-mt-20 flex items-end justify-between gap-4 relative z-10">
        <div className="relative">
          <StatusRing
            src={avatarUrl}
            size={120}
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
              className="absolute bottom-1 right-1 w-9 h-9 rounded-full flex items-center justify-center transition-colors"
              style={{ background: "#a855f7" }}
              aria-label="Edit avatar"
            >
              <Camera className="w-4 h-4 text-white" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 pb-3">
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
