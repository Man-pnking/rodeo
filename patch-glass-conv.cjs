const fs = require("fs");
const p = "src/pages/Conversation.jsx";
let s = fs.readFileSync(p, "utf8");

// Outer shell — glass background
s = s.replace(
  `        background: "#050510",
        zIndex: 30,`,
  `        background: "linear-gradient(180deg, rgba(10,8,20,0.92) 0%, rgba(5,5,16,0.96) 100%)",
        zIndex: 30,`
);

// Header — glass
s = s.replace(
  `          background: "rgba(10,8,15,0.75)",
          backdropFilter: "blur(20px)",`,
  `          background: "rgba(255, 255, 255, 0.04)",
          backdropFilter: "blur(28px) saturate(150%)",
          WebkitBackdropFilter: "blur(28px) saturate(150%)",`
);

// Input wrapper — glass
s = s.replace(
  `          background: "#0a0a0f",`,
  `          background: "rgba(255, 255, 255, 0.03)",
          backdropFilter: "blur(24px) saturate(140%)",
          WebkitBackdropFilter: "blur(24px) saturate(140%)",
          borderTop: "1px solid rgba(255,255,255,0.08)",`
);

fs.writeFileSync(p, s);
console.log("Conversation.jsx glassed");
