const fs = require("fs");
const p = "src/components/MediaPicker.jsx";
let s = fs.readFileSync(p, "utf8");

s = s.replace("const handleFile = async (file) => {", "const handleFiles = async (files) => {");

s = s.replace(
  `    if (!file) return;
    setUploading(true);
    const dims = await getDimensions(file);
    const { data, error } = await uploadMedia(file, dims);
    setUploading(false);
    if (error) {
      alert(error);
      return;
    }
    onPick?.(data);
    onClose?.();`,
  `    if (!files || files.length === 0) return;
    setUploading(true);
    const uploaded = [];
    for (const file of files) {
      const dims = await getDimensions(file);
      const { data, error } = await uploadMedia(file, dims);
      if (error) { alert(error); continue; }
      uploaded.push(data);
    }
    setUploading(false);
    if (uploaded.length > 0) {
      onPick?.(uploaded.length === 1 ? uploaded[0] : uploaded);
      onClose?.();
    }`
);

s = s.replace(
  `      const file = Array.from(e.clipboardData?.items || [])
        .find((i) => i.type.startsWith("image/"))
        ?.getAsFile();
      if (file) await handleFile(file);`,
  `      const files = Array.from(e.clipboardData?.items || [])
        .filter((i) => i.type.startsWith("image/"))
        .map((i) => i.getAsFile())
        .filter(Boolean);
      if (files.length) await handleFiles(files);`
);

s = s.replace(
  `    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);`,
  `    const files = Array.from(e.dataTransfer.files || []);
    if (files.length) handleFiles(files);`
);

s = s.replace(
  `onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}`,
  `onChange={(e) => e.target.files && handleFiles(Array.from(e.target.files))}`
);

s = s.replace(
  `type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"`,
  `type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp,image/gif"`
);

fs.writeFileSync(p, s);
console.log("MediaPicker.jsx multi-select ready");
