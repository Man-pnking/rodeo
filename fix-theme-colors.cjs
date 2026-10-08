const fs = require("fs");
const files = [
  "src/components/MessageBubble.jsx",
  "src/components/MessageInput.jsx",
  "src/components/Composer.jsx",
  "src/components/StatusComposer.jsx",
  "src/components/EditProfileModal.jsx",
  "src/components/MediaPicker.jsx",
  "src/components/ContactsConsent.jsx",
  "src/components/NewChatSheet.jsx",
  "src/components/CommentSheet.jsx",
  "src/components/Navigation.jsx",
  "src/components/ProfileHeader.jsx",
  "src/components/StatusBar.jsx",
  "src/components/StatusRing.jsx",
  "src/components/StatusViewer.jsx",
  "src/pages/ChatList.jsx",
  "src/pages/Conversation.jsx",
  "src/pages/Discover.jsx",
  "src/pages/Feed.jsx",
  "src/pages/Library.jsx",
  "src/pages/Login.jsx",
  "src/pages/Signup.jsx",
  "src/pages/Profile.jsx",
  "src/pages/UserProfile.jsx",
  "src/pages/Settings.jsx",
  "src/context/ToastContext.jsx",
];

const replacements = [
  [/#050510/g, "var(--bg)"],
  [/#0f0e18/g, "var(--bg-soft)"],
  [/#0a0a0f/g, "var(--bg-soft)"],
  [/#0f0e18/g, "var(--bg-soft)"],
  [/rgba\(15, 14, 24, 0\.9[0-9]\)/g, "var(--bg-soft)"],
  [/rgba\(15, 14, 24, 0\.8[0-9]\)/g, "var(--bg-soft)"],
  [/rgba\(10, 8, 15, 0\.9[0-9]\)/g, "var(--bg-soft)"],
  [/rgba\(10, 8, 15, 0\.7[0-9]\)/g, "var(--bg-soft)"],
  [/rgba\(10, 8, 15, 0\.6[0-9]\)/g, "rgba(10, 8, 15, 0.65)"],
  [/rgba\(255, 255, 255, 0\.0[0-5]\)/g, "var(--bg-card)"],
  [/rgba\(255, 255, 255, 0\.0[6-9]\)/g, "var(--bg-card-strong)"],
  [/rgba\(255, 255, 255, 0\.1[0-5]\)/g, "var(--border-strong)"],
  [/rgba\(255, 255, 255, 0\.08\)/g, "var(--border)"],
];

let total = 0;
for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let s = fs.readFileSync(file, "utf8");
  const before = s;
  for (const [pattern, replacement] of replacements) {
    s = s.replace(pattern, replacement);
  }
  if (s !== before) {
    fs.writeFileSync(file, s);
    total++;
    console.log("updated:", file);
  }
}
console.log(`\n${total} files updated`);
