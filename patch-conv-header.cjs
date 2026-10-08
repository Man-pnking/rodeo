const fs = require("fs");
const p = "src/pages/Conversation.jsx";
let s = fs.readFileSync(p, "utf8");

// Import GroupAvatar
if (s.indexOf("GroupAvatar") === -1) {
  s = s.replace(
    'import MessageInput from "../components/MessageInput.jsx";',
    'import MessageInput from "../components/MessageInput.jsx";\nimport GroupAvatar from "../components/GroupAvatar.jsx";'
  );
}

// Replace header content — handle both group and DM
const oldHeader = `        {other ? (
          <Link to={\`/u/\${other.username}\`} className="flex items-center gap-3 min-w-0 flex-1">
            <div
              className="w-10 h-10 rounded-full shrink-0"
              style={{
                background: other.avatar_url
                  ? \`url(\${other.avatar_url}) center/cover\`
                  : "linear-gradient(135deg, #ff6ec7 0%, #a855f7 100%)",
              }}
            />
            <div className="min-w-0">
              <div className="text-warm font-semibold text-sm truncate">
                {other.display_name || other.username}
              </div>
              <div className="text-xs text-warm-mute truncate">@{other.username}</div>
            </div>
          </Link>
        ) : (
          <div className="flex-1 text-warm-mute text-sm">Loading...</div>
        )}`;

const newHeader = `        {isGroup && group ? (
          <button
            onClick={() => navigate(\`/group/\${id}\`)}
            className="flex items-center gap-3 min-w-0 flex-1 text-left"
          >
            <GroupAvatar group={group} members={group.members} size={40} />
            <div className="min-w-0">
              <div className="text-warm font-semibold text-sm truncate">{group.name}</div>
              <div className="text-xs text-warm-mute truncate">
                {group.members?.length || 1} member{(group.members?.length || 1) !== 1 ? "s" : ""}
              </div>
            </div>
          </button>
        ) : other ? (
          <Link to={\`/u/\${other.username}\`} className="flex items-center gap-3 min-w-0 flex-1">
            <div
              className="w-10 h-10 rounded-full shrink-0"
              style={{
                background: other.avatar_url
                  ? \`url(\${other.avatar_url}) center/cover\`
                  : "linear-gradient(135deg, #ff6ec7 0%, #a855f7 100%)",
              }}
            />
            <div className="min-w-0">
              <div className="text-warm font-semibold text-sm truncate">
                {other.display_name || other.username}
              </div>
              <div className="text-xs text-warm-mute truncate">@{other.username}</div>
            </div>
          </Link>
        ) : (
          <div className="flex-1 text-warm-mute text-sm">Loading...</div>
        )}`;

if (s.indexOf(oldHeader) !== -1) {
  s = s.replace(oldHeader, newHeader);
  console.log("header updated");
} else {
  console.log("header pattern not found");
}

fs.writeFileSync(p, s);
console.log("Conversation.jsx written");
