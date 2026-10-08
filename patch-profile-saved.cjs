const fs = require("fs");
const p = "src/pages/Profile.jsx";
let s = fs.readFileSync(p, "utf8");

if (s.indexOf("SavedTab") === -1) {
  s = s.replace(
    'import EditProfileModal from "../components/EditProfileModal.jsx";',
    'import EditProfileModal from "../components/EditProfileModal.jsx";\nimport SavedTab from "../components/SavedTab.jsx";'
  );
}

// Replace the "saved" empty state with the real SavedTab
s = s.replace(
  `{tab === "saved" && (
            <EmptyState title="Nothing saved" body="Posts you save will be visible only to you." />
          )}`,
  `{tab === "saved" && <SavedTab />}`
);

fs.writeFileSync(p, s);
console.log("Profile.jsx patched");
