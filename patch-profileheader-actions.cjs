const fs = require("fs");
const p = "src/components/ProfileHeader.jsx";
let s = fs.readFileSync(p, "utf8");

if (s.indexOf("UserActionsMenu") === -1) {
  s = s.replace(
    'import StatusRing from "./StatusRing.jsx";',
    'import StatusRing from "./StatusRing.jsx";\nimport UserActionsMenu from "./UserActionsMenu.jsx";\nimport ReportModal from "./ReportModal.jsx";\nimport { MoreVertical } from "lucide-react";'
  );

  // Add state
  s = s.replace(
    "const [viewerOpen, setViewerOpen] = useState(false);",
    "const [viewerOpen, setViewerOpen] = useState(false);\n  const [actionsOpen, setActionsOpen] = useState(false);\n  const [reportOpen, setReportOpen] = useState(false);"
  );

  // Add ··· button next to Message button for other users
  s = s.replace(
    `          ) : (
            <>
              <button onClick={onMessage} className="btn-ghost flex items-center gap-2 text-sm">
                <MessageCircle className="w-4 h-4" />
                Message
              </button>`,
    `          ) : (
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
              </button>`
  );

  // Add modals before closing div
  s = s.replace(
    `      {viewerOpen && statusInfo.group && (`,
    `      {profile && (
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

      {viewerOpen && statusInfo.group && (`
  );
}

fs.writeFileSync(p, s);
console.log("ProfileHeader.jsx wired");
