import { useState } from "react";
import { Plus } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useProfile } from "../hooks/useProfile";
import { useStatuses } from "../hooks/useStatuses";
import StatusRing from "./StatusRing.jsx";
import StatusViewer from "./StatusViewer.jsx";
import StatusComposer from "./StatusComposer.jsx";

export default function StatusBar() {
  const { user } = useAuth();
  const { profile } = useProfile(user?.id);
  const { groups, reload } = useStatuses(user?.id);
  const [viewerIndex, setViewerIndex] = useState(null);
  const [composerOpen, setComposerOpen] = useState(false);

  const myGroup = groups.find((g) => g.author_id === user?.id);
  const otherGroups = groups.filter((g) => g.author_id !== user?.id);

  const openMyStatus = () => {
    if (myGroup) {
      setViewerIndex(groups.indexOf(myGroup));
    } else {
      setComposerOpen(true);
    }
  };

  return (
    <>
      <div className="flex items-start gap-4 overflow-x-auto pb-6 -mx-6 px-6 no-scrollbar">
        {/* My status */}
        <button
          onClick={openMyStatus}
          className="flex flex-col items-center gap-2 shrink-0"
          aria-label="Your status"
        >
          <div className="relative">
            <StatusRing
              src={profile?.avatar_url}
              size={56}
              hasStatus={!!myGroup}
              hasUnseen={!!myGroup && myGroup.hasUnseen}
              fallbackInitial={profile?.display_name || profile?.username || "U"}
            />
            {!myGroup && (
              <div
                className="absolute bottom-0 right-0 flex items-center justify-center"
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, var(--brand) 0%, var(--violet) 100%)",
                  border: "2px solid var(--bg)",
                }}
              >
                <Plus className="w-3 h-3 text-white" strokeWidth={3} />
              </div>
            )}
          </div>
          <span className="text-[11px] text-warm-mute max-w-[64px] truncate">
            You
          </span>
        </button>

        {/* Others */}
        {otherGroups.map((g, i) => {
          const realIndex = groups.indexOf(g);
          return (
            <button
              key={g.author_id}
              onClick={() => setViewerIndex(realIndex)}
              className="flex flex-col items-center gap-2 shrink-0"
              aria-label={`${g.author?.username}'s status`}
            >
              <StatusRing
                src={g.author?.avatar_url}
                size={56}
                hasStatus
                hasUnseen={g.hasUnseen}
                fallbackInitial={g.author?.display_name || g.author?.username || "?"}
              />
              <span className="text-[11px] text-warm-mute max-w-[64px] truncate">
                {g.author?.display_name || g.author?.username}
              </span>
            </button>
          );
        })}
      </div>

      {viewerIndex !== null && (
        <StatusViewer
          groups={groups}
          startIndex={viewerIndex}
          onClose={() => {
            setViewerIndex(null);
            reload();
          }}
        />
      )}

      <StatusComposer
        open={composerOpen}
        onClose={() => setComposerOpen(false)}
        onPosted={() => {
          setComposerOpen(false);
          reload();
        }}
      />
    </>
  );
}
