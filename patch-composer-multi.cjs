const fs = require("fs");
const p = "src/components/Composer.jsx";
let s = fs.readFileSync(p, "utf8");

// Change single image state to array
s = s.replace(
  "const [image, setImage] = useState(null);",
  "const [images, setImages] = useState([]);"
);

// Update submit
s = s.replace(
  "const { error } = await createPost(body, image?.url || null);",
  "const { error } = await createPost(body, images.map(i => i.url));"
);

s = s.replace(
  "setBody(\"\");\n      setImage(null);",
  "setBody(\"\");\n      setImages([]);"
);

s = s.replace(
  "const canPost = (body.trim() || image) && !posting;",
  "const canPost = (body.trim() || images.length > 0) && !posting;"
);

// Replace the single image preview with a grid
s = s.replace(
  `{image && (
              <div className="relative mt-3 rounded-2xl overflow-hidden">
                <img src={image.url} alt="" className="w-full max-h-96 object-cover" />
                <button
                  onClick={() => setImage(null)}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(0,0,0,0.6)" }}
                  aria-label="Remove image"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            )}`,
  `{images.length > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                {images.map((img, idx) => (
                  <div key={img.id || idx} className="relative rounded-2xl overflow-hidden aspect-square">
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setImages((prev) => prev.filter((_, i) => i !== idx))}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center"
                      style={{ background: "rgba(0,0,0,0.65)" }}
                      aria-label="Remove image"
                    >
                      <X className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}`
);

// Update onPick to handle both single + array
s = s.replace(
  "onPick={(media) => setImage(media)}",
  "onPick={(media) => {\n          const arr = Array.isArray(media) ? media : [media];\n          setImages((prev) => [...prev, ...arr]);\n        }}"
);

fs.writeFileSync(p, s);
console.log("Composer.jsx multi-image ready");
