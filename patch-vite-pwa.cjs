const fs = require("fs");
const p = "vite.config.js";
let s = fs.readFileSync(p, "utf8");

if (s.indexOf("importScripts") === -1) {
  // Add importScripts to workbox config
  s = s.replace(
    `      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico,woff2}"],`,
    `      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico,woff2}"],
        importScripts: ["sw-push.js"],`
  );
}

fs.writeFileSync(p, s);
console.log("vite.config.js updated with sw-push import");
