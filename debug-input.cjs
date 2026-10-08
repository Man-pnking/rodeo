const fs = require("fs");
const p = "src/pages/Conversation.jsx";
let s = fs.readFileSync(p, "utf8");

// Force the container to be a simple block with a red border for debugging
const oldOuter = `    <div
      className="flex flex-col fixed inset-0 z-30 md:static md:h-screen"
      style={{
        height: "100dvh",
        background: "rgba(5,5,16,0.4)",
      }}
    >`;
const newOuter = `    <div
      className="flex flex-col"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(5,5,16,0.4)",
        border: "2px solid red",
      }}
    >`;

if (s.indexOf(oldOuter) !== -1) {
  s = s.replace(oldOuter, newOuter);
  console.log("outer replaced with explicit fixed");
} else {
  console.log("outer pattern NOT found — trying fallback");
  // Try any variant
  s = s.replace(
    /className="flex flex-col fixed inset-0 z-30 md:static md:h-screen"[\s\S]*?>/,
    `className="flex flex-col"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(5,5,16,0.4)",
        border: "2px solid red",
      }}
    >`
  );
  console.log("fallback applied");
}

// Also give the input a bright background temporarily
s = s.replace(
  '<div className="shrink-0" style={{ paddingBottom: "env(safe-area-inset-bottom, 0)" }}>',
  '<div className="shrink-0" style={{ paddingBottom: "env(safe-area-inset-bottom, 0)", background: "rgba(255,0,0,0.2)", minHeight: "80px" }}>'
);

fs.writeFileSync(p, s);
console.log("debug layout written");
