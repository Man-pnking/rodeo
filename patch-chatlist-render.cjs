const fs = require("fs");
const p = "src/pages/ChatList.jsx";
let s = fs.readFileSync(p, "utf8");

// Replace the whole conversations-render block with merged items
const startMarker = "{!loading && conversations.length > 0 && (";
const endMarker = "      )}\n\n      <NewChatSheet";

const start = s.indexOf(startMarker);
const end = s.indexOf(endMarker);

if (start === -1 || end === -1) {
  console.log("markers not found");
} else {
  const replacement = `{!loading && mergedItems.length > 0 && (
        <div>
          {mergedItems.map((item) => (
            <Link
              key={\`\${item.type}-\${item.id}\`}
              to={item.to}
              className="flex items-center gap-4 py-4 hover:bg-white/[0.02] transition-colors -mx-2 px-2 rounded-xl"
            >
              {item.type === "group" ? (
                <GroupAvatar group={item.group} members={item.group.members} size={48} />
              ) : (
                <div
                  className="w-12 h-12 rounded-full shrink-0"
                  style={{
                    background: item.avatar
                      ? \`url(\${item.avatar}) center/cover\`
                      : "linear-gradient(135deg, #ff6ec7 0%, #a855f7 100%)",
                  }}
                />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3 mb-1">
                  <div className="text-warm font-medium truncate">{item.name}</div>
                  <div className="text-xs text-warm-mute shrink-0">
                    {timeAgo(item.lastAt)}
                  </div>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <div className="text-sm text-warm-mute truncate">
                    {item.lastMessage?.image_url && !item.lastMessage?.body
                      ? "📷 Photo"
                      : item.lastMessage?.body || (item.type === "group" ? "Group created" : "Start the conversation")}
                  </div>
                  {item.unread > 0 && (
                    <span
                      className="shrink-0 min-w-[20px] h-5 rounded-full flex items-center justify-center text-[10px] font-bold px-1.5 text-white"
                      style={{ background: "linear-gradient(135deg, #ff6ec7 0%, #a855f7 100%)" }}
                    >
                      {item.unread}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

`;
  s = s.slice(0, start) + replacement + s.slice(end);
  console.log("render block replaced");
}

fs.writeFileSync(p, s);
console.log("ChatList.jsx written");
