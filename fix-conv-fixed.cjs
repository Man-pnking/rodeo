const fs = require("fs");
const p = "src/pages/Conversation.jsx";
let s = fs.readFileSync(p, "utf8");

// Remove any existing outer wrapper block
s = s.replace(
  /<div\s+className="flex flex-col fixed inset-0 z-30 md:static md:h-screen"[\s\S]*?>/,
  ""
);

s = s.replace(
  /<div\s+style={{\s*position: "fixed",[\s\S]*?zIndex: 30,\s*}}[\s\S]*?>/,
  ""
);

// Insert the new explicit wrapper
const newOuter = `<div
      className="conversation-shell"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        flexDirection: "column",
        background: "#050510",
        zIndex: 30,
        paddingTop: "env(safe-area-inset-top, 0)",
      }}
    >`;

// Find the return ( and put new wrapper right after
s = s.replace(/return \(\s*/, `return (\n    ${newOuter}\n`);

fs.writeFileSync(p, s);
console.log("Conversation.jsx wrapper replaced");
