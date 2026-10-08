const fs = require("fs");
const p = "src/components/ProfileHeader.jsx";
let s = fs.readFileSync(p, "utf8");

// 1. Banner — smaller heights
s = s.replace(
  'className="relative w-full h-48 sm:h-64 md:h-80 overflow-hidden"',
  'className="relative w-full h-32 sm:h-44 md:h-56 overflow-hidden"'
);

// 2. Avatar — smaller
s = s.replace(
  'size={120}',
  'size={88}'
);

// 3. Avatar overlap — less negative margin
s = s.replace(
  'className="max-w-4xl mx-auto px-6 -mt-16 sm:-mt-20 flex items-end justify-between gap-4 relative z-10"',
  'className="max-w-4xl mx-auto px-6 -mt-12 sm:-mt-14 flex items-end justify-between gap-4 relative z-10"'
);

// 4. Edit avatar button — smaller
s = s.replace(
  'className="absolute bottom-1 right-1 w-9 h-9 rounded-full flex items-center justify-center transition-colors"',
  'className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors"'
);

// 5. Camera icon in the edit button — smaller
s = s.replace(
  '<Camera className="w-4 h-4 text-white" />\n            </button>\n          )}',
  '<Camera className="w-3 h-3 text-white" />\n            </button>\n          )}'
);

fs.writeFileSync(p, s);
console.log("ProfileHeader shrunk");
