const fs = require("fs");
const p = "src/components/ProfileHeader.jsx";
let s = fs.readFileSync(p, "utf8");

// Replace the specific broken closing tag
const broken = `          >
            <Camera className="w-4 h-4 text-white" />
          </button>
        )}
      </div>`;

const fixed = `          >
            <Camera className="w-4 h-4 text-white" />
          </button>
        )}
      </ParallaxLayer>`;

if (s.indexOf(broken) !== -1) {
  s = s.replace(broken, fixed);
  console.log("closing tag fixed");
} else {
  console.log("pattern not found — trying fallback");
  // Try a simpler approach
  s = s.replace(
    /(<ParallaxLayer[\s\S]*?<\/button>\s*\)\s*})\s*<\/div>/,
    "$1</ParallaxLayer>"
  );
  console.log("fallback applied");
}

fs.writeFileSync(p, s);
console.log("ProfileHeader.jsx written");
