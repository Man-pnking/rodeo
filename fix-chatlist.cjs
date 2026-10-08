const fs = require("fs");
const p = "src/pages/ChatList.jsx";
let s = fs.readFileSync(p, "utf8");

// Remove the stray duplicated )}
s = s.replace(
  `        </div>
      )}

      )}

      <NewChatSheet`,
  `        </div>
      )}

      <NewChatSheet`
);

fs.writeFileSync(p, s);
console.log("stray )} removed");
