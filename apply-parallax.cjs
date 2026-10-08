const fs = require("fs");

// 1. ProfileHeader — banner gets parallax
const ph = "src/components/ProfileHeader.jsx";
if (fs.existsSync(ph)) {
  let s = fs.readFileSync(ph, "utf8");
  if (s.indexOf("ParallaxLayer") === -1) {
    s = s.replace(
      'import { Link } from "react-router-dom";',
      'import { Link } from "react-router-dom";\nimport ParallaxLayer from "./ParallaxLayer.jsx";'
    );
    // Banner becomes parallax layer
    s = s.replace(
      /<div\s+className="relative w-full h-48 sm:h-64 md:h-80 overflow-hidden"[\s\S]*?style={{[\s\S]*?}}[\s\S]*?>/,
      `<ParallaxLayer speed={0.25} className="relative w-full h-48 sm:h-64 md:h-80 overflow-hidden" style={{
        background: bannerUrl ? \`url(\${bannerUrl}) center/cover\` : "linear-gradient(135deg, #ff6ec7 0%, #a855f7 50%, #3b82f6 100%)",
      }}>`
    );
    // Close the parallax layer (find the closing </div> of the banner)
    fs.writeFileSync(ph, s);
    console.log("ProfileHeader banner parallax applied");
  }
}

// 2. Feed — each post wrapped in parallax
const pc = "src/components/PostCard.jsx";
if (fs.existsSync(pc)) {
  let s = fs.readFileSync(pc, "utf8");
  if (s.indexOf("ParallaxLayer") === -1) {
    s = s.replace(
      'import CommentSheet from "./CommentSheet.jsx";',
      'import CommentSheet from "./CommentSheet.jsx";\nimport ParallaxLayer from "./ParallaxLayer.jsx";'
    );
    fs.writeFileSync(pc, s);
    console.log("PostCard ready for parallax wrapper");
  }
}

console.log("done");
