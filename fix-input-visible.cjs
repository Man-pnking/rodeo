const fs = require("fs");
const p = "src/pages/Conversation.jsx";
let s = fs.readFileSync(p, "utf8");

// Replace the outer container with explicit inline flex layout
const start = s.indexOf("<div");
const end = s.indexOf(">", s.indexOf('background: "rgba(5,5,16,0.4)",'));

const newOuter = `<div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        flexDirection: "column",
        background: "rgba(5,5,16,0.4)",
        zIndex: 30,
      }}
    >`;

// Replace the outer wrapper block
s = s.replace(
  /<div\s+className="flex flex-col fixed inset-0 z-30 md:static md:h-screen"[\s\S]*?>/,
  newOuter
);

// Make the messages area explicitly scrollable flex-1
s = s.replace(
  'className="flex-1 overflow-y-auto px-4 py-4"',
  'className="px-4 py-4"\n        style={{ flex: 1, overflowY: "auto", background: "rgba(5,5,16,0.4)", minHeight: 0 }}'
);

// Remove the duplicate style on the messages div
s = s.replace(
  'style={{ background: "rgba(5,5,16,0.4)" }}\n      >\n        {loading &&',
  '>\n        {loading &&'
);

// Make sure the input wrapper is flex-shrink 0
s = s.replace(
  '<div className="shrink-0" style={{ paddingBottom: "env(safe-area-inset-bottom, 0)" }}>',
  '<div style={{ flexShrink: 0, paddingBottom: "env(safe-area-inset-bottom, 0)" }}>'
);

fs.writeFileSync(p, s);
console.log("Conversation.jsx fixed");
