const fs = require("fs");

// 1. AppLayout
const layout = "src/components/AppLayout.jsx";
if (fs.existsSync(layout)) {
  let s = fs.readFileSync(layout, "utf8");
  if (s.indexOf("overflow-x-hidden") === -1) {
    s = s.replace(
      '<div className="min-h-screen">',
      '<div className="min-h-screen w-full overflow-x-hidden">'
    );
    s = s.replace(
      '<main className="md:ml-64 pb-24 md:pb-0 min-h-screen">',
      '<main className="md:ml-64 pb-24 md:pb-0 min-h-screen w-full overflow-x-hidden">'
    );
    fs.writeFileSync(layout, s);
    console.log("AppLayout fixed");
  }
}

// 2. Navigation — mobile bottom nav
const nav = "src/components/Navigation.jsx";
if (fs.existsSync(nav)) {
  let s = fs.readFileSync(nav, "utf8");
  if (s.indexOf("overflow-x-hidden") === -1) {
    s = s.replace(
      '<nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 safe-bottom">',
      '<nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 safe-bottom" style={{ maxWidth: "100vw", overflow: "hidden" }}>'
    );
    fs.writeFileSync(nav, s);
    console.log("Navigation fixed");
  }
}

// 3. Any page containers with max-w + mx-auto need w-full
const pages = [
  "src/pages/Feed.jsx",
  "src/pages/ChatList.jsx",
  "src/pages/Discover.jsx",
  "src/pages/Profile.jsx",
  "src/pages/UserProfile.jsx",
  "src/pages/Settings.jsx",
  "src/pages/Library.jsx",
];

for (const p of pages) {
  if (!fs.existsSync(p)) continue;
  let s = fs.readFileSync(p, "utf8");
  if (s.indexOf("max-w-2xl mx-auto px-6 py-8 w-full") === -1) {
    s = s.replace(
      /className="max-w-2xl mx-auto px-6 py-8"/g,
      'className="max-w-2xl mx-auto px-6 py-8 w-full"'
    );
    s = s.replace(
      /className="max-w-3xl mx-auto px-6 py-8"/g,
      'className="max-w-3xl mx-auto px-6 py-8 w-full"'
    );
    s = s.replace(
      /className="max-w-4xl mx-auto px-6 py-8"/g,
      'className="max-w-4xl mx-auto px-6 py-8 w-full"'
    );
    fs.writeFileSync(p, s);
  }
}
console.log("pages checked");
