const fs = require("fs");
const files = [
  "src/pages/ChatList.jsx",
  "src/pages/Conversation.jsx",
  "src/pages/Feed.jsx",
  "src/components/StatusBar.jsx",
];

for (const f of files) {
  if (!fs.existsSync(f)) continue;
  let s = fs.readFileSync(f, "utf8");
  if (s.indexOf("scroll-area") === -1) {
    s = s.replace(/className="flex-1 overflow-y-auto/g, 'className="flex-1 overflow-y-auto scroll-area');
    s = s.replace(/className="overflow-x-auto/g, 'className="overflow-x-auto scroll-area');
    fs.writeFileSync(f, s);
    console.log("updated:", f);
  }
}
console.log("done");
