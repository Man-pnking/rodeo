import { Camera, Settings as SettingsIcon, UserPlus, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

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
  const avatarUrl = profile?.avatar_url;
  const bannerUrl = profile?.banner_url;

  return (
    <div className="relative">
      {/* Banner */}
      <div
        className="relative w-full h-48 sm:h-64 md:h-80 overflow-hidden"
        style={{
          background: bannerUrl
            ? `url(${bannerUrl}) center/cover`
            : "linear-gradient(135deg, #ff6ec7 0%, #a855f7 50%, #3b82f6 100%)",
        }}
      >
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
      </div>

      {/* Avatar + actions */}
      <div className="max-w-4xl mx-auto px-6 -mt-16 sm:-mt-20 flex items-end justify-between gap-4 relative z-10">
        <div className="relative">
          <div
            className="rounded-full overflow-hidden ring-4"
            style={{
              width: 128,
              height: 128,
              background: avatarUrl
                ? `url(${avatarUrl}) center/cover`
                : "linear-gradient(135deg, #ff6ec7 0%, #a855f7 50%, #3b82f6 100%)",
              borderColor: "#050510",
              boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            }}
          >
            {!avatarUrl && (
              <div className="w-full h-full flex items-center justify-center">
                <span
                  className="text-white"
                  style={{
                    fontFamily: '"Space Grotesk", Inter, sans-serif',
                    fontSize: 56,
                    fontWeight: 800,
                  }}
                >
                  {(profile?.display_name || profile?.username || "U")[0].toUpperCase()}
                </span>
              </div>
            )}
          </div>
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
    </div>
  );
}
