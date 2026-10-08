const fs = require("fs");
const p = "src/App.jsx";
let s = fs.readFileSync(p, "utf8");

// Add React.lazy + Suspense imports
if (s.indexOf("React.lazy") === -1 && s.indexOf("lazy,") === -1) {
  // Add lazy import at top
  s = s.replace(
    'import { useEffect, useState } from "react";',
    'import { useEffect, useState, lazy, Suspense } from "react";'
  );

  // Convert page imports to lazy
  const lazyMap = [
    ["Feed", "./pages/Feed.jsx"],
    ["Login", "./pages/Login.jsx"],
    ["Signup", "./pages/Signup.jsx"],
    ["Profile", "./pages/Profile.jsx"],
    ["UserProfile", "./pages/UserProfile.jsx"],
    ["Friends", "./pages/Friends.jsx"],
    ["Messages", "./pages/Messages.jsx"],
    ["Compose", "./pages/Compose.jsx"],
    ["ChatList", "./pages/ChatList.jsx"],
    ["Conversation", "./pages/Conversation.jsx"],
    ["Discover", "./pages/Discover.jsx"],
    ["Library", "./pages/Library.jsx"],
    ["Settings", "./pages/Settings.jsx"],
    ["SettingsAccount", "./pages/settings/Account.jsx"],
    ["SettingsPrivacy", "./pages/settings/Privacy.jsx"],
    ["SettingsNotifications", "./pages/settings/Notifications.jsx"],
    ["SettingsStorage", "./pages/settings/Storage.jsx"],
    ["SettingsChat", "./pages/settings/Chat.jsx"],
    ["SettingsAppearance", "./pages/settings/Appearance.jsx"],
    ["SettingsGeneral", "./pages/settings/General.jsx"],
    ["GroupInfo", "./pages/GroupInfo.jsx"],
    ["Home", "./pages/Home.jsx"],
  ];

  for (const [name, path] of lazyMap) {
    const staticImport = `import ${name} from "${path}";`;
    const lazyImport = `const ${name} = lazy(() => import("${path}"));`;
    s = s.replace(staticImport, lazyImport);
  }

  // Wrap Routes in Suspense
  s = s.replace(
    "        {splashDone && onboarded && (\n          <Routes>",
    `        {splashDone && onboarded && (
          <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
              <div className="w-8 h-8 rounded-full border-2 border-iri-pink border-t-transparent animate-spin" />
            </div>
          }>
          <Routes>`
  );

  s = s.replace(
    "          </Routes>\n        )}",
    "          </Routes>\n          </Suspense>\n        )}"
  );
}

fs.writeFileSync(p, s);
console.log("App.jsx lazy-loaded");
