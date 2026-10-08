const fs = require("fs");
const p = "src/pages/settings/Privacy.jsx";
let s = fs.readFileSync(p, "utf8");

if (s.indexOf("CloseFriendsList") === -1) {
  s = s.replace(
    'import BlockedList from "../../components/BlockedList.jsx";',
    'import BlockedList from "../../components/BlockedList.jsx";\nimport CloseFriendsList from "../../components/CloseFriendsList.jsx";\nimport { Star } from "lucide-react";'
  );

  // Insert Close Friends section above Blocked
  s = s.replace(
    `<SlideIn variant="up" delay={0.1}>
        <SettingsSection title="Blocked">
          <BlockedList />
        </SettingsSection>
      </SlideIn>`,
    `<SlideIn variant="up" delay={0.1}>
        <SettingsSection title="Close Friends">
          <CloseFriendsList />
        </SettingsSection>
      </SlideIn>

      <SlideIn variant="up" delay={0.15}>
        <SettingsSection title="Blocked">
          <BlockedList />
        </SettingsSection>
      </SlideIn>`
  );
}

fs.writeFileSync(p, s);
console.log("Privacy.jsx Close Friends wired");
