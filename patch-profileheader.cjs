const fs = require("fs");
const p = "src/components/ProfileHeader.jsx";
let s = fs.readFileSync(p, "utf8");

// Add imports if missing
if (s.indexOf("StatusRing") === -1) {
  s = s.replace(
    'import { Link } from "react-router-dom";',
    'import { Link } from "react-router-dom";\nimport { useState } from "react";\nimport StatusRing from "./StatusRing.jsx";\nimport StatusViewer from "./StatusViewer.jsx";\nimport { useStatusContext } from "../context/StatusContext.jsx";'
  );
}

// Add state + hook at the top of the component
if (s.indexOf("useStatusContext()") === -1) {
  s = s.replace(
    "  const avatarUrl = profile?.avatar_url;",
    "  const [viewerOpen, setViewerOpen] = useState(false);\n  const { groups, getStatusFor, reload } = useStatusContext();\n  const statusInfo = getStatusFor(profile?.id);\n  const avatarUrl = profile?.avatar_url;"
  );
}

// Replace the avatar wrapper div with StatusRing
const oldAvatarBlock = `<div
            className="rounded-full overflow-hidden ring-4"
            style={{
              width: 128,
              height: 128,
              background: avatarUrl
                ? \`url(\${avatarUrl}) center/cover\`
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
          </div>`;

const newAvatarBlock = `<StatusRing
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
          />`;

if (s.indexOf(oldAvatarBlock) !== -1) {
  s = s.replace(oldAvatarBlock, newAvatarBlock);
  console.log("avatar replaced");
} else {
  console.log("avatar block NOT FOUND");
  // fallback — try simpler pattern
  const simpleOld = `className="rounded-full overflow-hidden ring-4"`;
  if (s.indexOf(simpleOld) !== -1) {
    console.log("fallback pattern found — needs manual edit");
  }
}

// Add StatusViewer before final closing div
const closeMark = `      </div>
    </div>
  );
}`;

const withViewer = `      </div>

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
}`;

if (s.indexOf(closeMark) !== -1) {
  s = s.replace(closeMark, withViewer);
  console.log("viewer added");
} else {
  console.log("close block NOT FOUND");
}

fs.writeFileSync(p, s);
console.log("ProfileHeader.jsx written");
