const fs = require("fs");
const p = "src/App.jsx";
let s = fs.readFileSync(p, "utf8");

// 1. SettingsProvider
if (s.indexOf("SettingsProvider") === -1) {
  s = s.replace(
    'import { ParallaxProvider } from "./context/ParallaxContext.jsx";',
    'import { ParallaxProvider } from "./context/ParallaxContext.jsx";\nimport { SettingsProvider } from "./context/SettingsContext.jsx";'
  );
  s = s.replace("    <ParallaxProvider>", "    <ParallaxProvider>\n    <SettingsProvider>");
  s = s.replace("    </ParallaxProvider>", "    </SettingsProvider>\n    </ParallaxProvider>");
}

// 2. Sub-page imports
if (s.indexOf("SettingsAccount") === -1) {
  s = s.replace(
    'import Settings from "./pages/Settings.jsx";',
    'import Settings from "./pages/Settings.jsx";\nimport SettingsAccount from "./pages/settings/Account.jsx";\nimport SettingsPrivacy from "./pages/settings/Privacy.jsx";\nimport SettingsNotifications from "./pages/settings/Notifications.jsx";\nimport SettingsStorage from "./pages/settings/Storage.jsx";\nimport SettingsChat from "./pages/settings/Chat.jsx";\nimport SettingsAppearance from "./pages/settings/Appearance.jsx";\nimport SettingsGeneral from "./pages/settings/General.jsx";'
  );
}

// 3. Sub-routes
if (s.indexOf('path="/settings/account"') === -1) {
  const oldRoute = '<Route path="/settings" element={<RequireAuth><AppLayout><Settings /></AppLayout></RequireAuth>} />';
  const newRoutes = `${oldRoute}
            <Route path="/settings/account" element={<RequireAuth><AppLayout><SettingsAccount /></AppLayout></RequireAuth>} />
            <Route path="/settings/privacy" element={<RequireAuth><AppLayout><SettingsPrivacy /></AppLayout></RequireAuth>} />
            <Route path="/settings/notifications" element={<RequireAuth><AppLayout><SettingsNotifications /></AppLayout></RequireAuth>} />
            <Route path="/settings/storage" element={<RequireAuth><AppLayout><SettingsStorage /></AppLayout></RequireAuth>} />
            <Route path="/settings/chat" element={<RequireAuth><AppLayout><SettingsChat /></AppLayout></RequireAuth>} />
            <Route path="/settings/appearance" element={<RequireAuth><AppLayout><SettingsAppearance /></AppLayout></RequireAuth>} />
            <Route path="/settings/general" element={<RequireAuth><AppLayout><SettingsGeneral /></AppLayout></RequireAuth>} />`;
  if (s.indexOf(oldRoute) !== -1) {
    s = s.replace(oldRoute, newRoutes);
    console.log("sub-routes added");
  } else {
    console.log("settings route not found");
  }
}

fs.writeFileSync(p, s);
console.log("App.jsx written");
