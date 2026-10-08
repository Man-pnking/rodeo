const fs = require("fs");
const p = "src/components/MessageBubble.jsx";
let s = fs.readFileSync(p, "utf8");

// Accept senderName prop
s = s.replace(
  "export default function MessageBubble({ message, isOwn }) {",
  "export default function MessageBubble({ message, isOwn, senderName, showSender }) {"
);

// Show sender name above bubble for other users in group
s = s.replace(
  `        <div
          className="px-4 py-2.5"`,
  `        {showSender && !isOwn && senderName && (
          <div className="text-[11px] text-iri-pink font-medium mb-1 px-2">
            {senderName}
          </div>
        )}
        <div
          className="px-4 py-2.5"`
);

fs.writeFileSync(p, s);
console.log("MessageBubble.jsx patched");
