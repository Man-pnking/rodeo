const fs = require("fs");
const p = "src/hooks/useFeed.js";
let s = fs.readFileSync(p, "utf8");

// Change signature
s = s.replace(
  "const createPost = async (body, imageUrl) => {",
  "const createPost = async (body, imageUrls) => {"
);

// Change insert payload — for now, join urls with comma (MVP)
// Later we'll add a proper post_media table
s = s.replace(
  "insert({ author_id: userId, body: body.trim(), image_url: imageUrl || null })",
  `insert({
        author_id: userId,
        body: body.trim(),
        image_url: Array.isArray(imageUrls) && imageUrls.length > 0 ? imageUrls[0] : (imageUrls || null),
      })`
);

fs.writeFileSync(p, s);
console.log("useFeed.js ready (stores first image — full carousel coming)");
