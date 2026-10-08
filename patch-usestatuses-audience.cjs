const fs = require("fs");
const p = "src/hooks/useStatuses.js";
let s = fs.readFileSync(p, "utf8");

// Update createStatus signature + insert
s = s.replace(
  "const createStatus = async (userId, file, caption) => {",
  "const createStatus = async (userId, file, caption, audience = \"contacts\") => {"
);

s = s.replace(
  `    const { error } = await supabase.from("statuses").insert({
      author_id: userId,
      image_url: pub.publicUrl,
      caption: caption?.trim() || null,
    });`,
  `    const { error } = await supabase.from("statuses").insert({
      author_id: userId,
      image_url: pub.publicUrl,
      caption: caption?.trim() || null,
      audience,
    });`
);

// Fetch audience column
s = s.replace(
  'select("id, author_id, image_url, caption, expires_at, created_at")',
  'select("id, author_id, image_url, caption, expires_at, created_at, audience")'
);

fs.writeFileSync(p, s);
console.log("useStatuses.js audience wired");
