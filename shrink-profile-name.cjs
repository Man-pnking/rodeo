const fs = require("fs");

for (const file of ["src/pages/Profile.jsx", "src/pages/UserProfile.jsx"]) {
  if (!fs.existsSync(file)) continue;
  let s = fs.readFileSync(file, "utf8");
  s = s.replace(
    /<h1 className="display-lg mb-1">/g,
    '<h1 className="display-md mb-1">'
  );
  s = s.replace(
    /<h1 className="display-lg mb-2">/g,
    '<h1 className="display-md mb-2">'
  );
  fs.writeFileSync(file, s);
  console.log("updated:", file);
}
