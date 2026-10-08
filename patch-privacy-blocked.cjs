const fs = require("fs");
const p = "src/pages/settings/Privacy.jsx";
let s = fs.readFileSync(p, "utf8");

if (s.indexOf("BlockedList") === -1) {
  s = s.replace(
    'import { SettingsSection, SettingsSelect, SettingsToggle, SettingsRow } from "../../components/SettingsUI.jsx";',
    'import { SettingsSection, SettingsSelect, SettingsToggle, SettingsRow } from "../../components/SettingsUI.jsx";\nimport BlockedList from "../../components/BlockedList.jsx";'
  );

  // Replace the "0 contacts blocked" static row with inline BlockedList
  s = s.replace(
    `<SettingsRow icon={Ban} label="Blocked contacts" subtitle="0 contacts blocked" onClick={() => {}} />`,
    `<BlockedList />`
  );
}

// Remove unused Ban import
s = s.replace('import { ArrowLeft, Ban } from "lucide-react";', 'import { ArrowLeft } from "lucide-react";');

fs.writeFileSync(p, s);
console.log("Privacy.jsx wired with BlockedList");
