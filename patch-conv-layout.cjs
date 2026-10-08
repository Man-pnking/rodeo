const fs = require("fs");
const p = "src/pages/Conversation.jsx";
let s = fs.readFileSync(p, "utf8");

// Replace the outer container — use fixed positioning instead of 100dvh
const oldOuter = `    <div className="flex flex-col" style={{ height: "100dvh" }}>`;
const newOuter = `    <div
      className="flex flex-col fixed inset-0 md:static md:h-screen"
      style={{ background: "rgba(5,5,16,0.4)" }}
    >`;

if (s.indexOf(oldOuter) !== -1) {
  s = s.replace(oldOuter, newOuter);
  console.log("outer replaced");
} else {
  console.log("outer not found");
}

fs.writeFileSync(p, s);
console.log("Conversation.jsx layout patched");
