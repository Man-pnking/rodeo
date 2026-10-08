const fs = require("fs");
const p = "src/pages/Conversation.jsx";
let s = fs.readFileSync(p, "utf8");

// Replace the outer wrapper with proper mobile-safe layout
const oldOuter = `    <div
      className="flex flex-col fixed inset-0 md:static md:h-screen"
      style={{ background: "rgba(5,5,16,0.4)" }}
    >`;
const newOuter = `    <div
      className="flex flex-col fixed inset-0 z-30 md:static md:h-screen"
      style={{
        height: "100dvh",
        maxHeight: "-webkit-fill-available",
        background: "rgba(5,5,16,0.4)",
      }}
    >`;

if (s.indexOf(oldOuter) !== -1) {
  s = s.replace(oldOuter, newOuter);
  console.log("outer replaced");
} else {
  console.log("outer not found");
}

// Add bottom padding to input area for safe-area
const oldInput = `<MessageInput onSend={(body, imageUrl) => send(body, imageUrl)} disabled={loading} />`;
const newInput = `<div className="shrink-0" style={{ paddingBottom: "env(safe-area-inset-bottom, 0)" }}>
        <MessageInput onSend={(body, imageUrl) => send(body, imageUrl)} disabled={loading} />
      </div>`;

if (s.indexOf(oldInput) !== -1) {
  s = s.replace(oldInput, newInput);
  console.log("input wrapped");
} else {
  console.log("input not found");
}

fs.writeFileSync(p, s);
console.log("Conversation.jsx written");
