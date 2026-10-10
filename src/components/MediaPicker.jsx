import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Camera,
  Upload,
  Image as ImageIcon,
  Clipboard,
  Check,
  AlertCircle,
  Loader2,
  Send,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useMedia } from "../hooks/useMedia";

const MAX_FILES = 4;
const MAX_SIZE_MB = 5;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export default function MediaPicker({ open, onClose, onPick }) {
  const { user } = useAuth();
  const { items, loading, uploadMedia } = useMedia(user?.id);
  const [tab, setTab] = useState("sources");
  const [dragActive, setDragActive] = useState(false);
  const [staged, setStaged] = useState([]); // files pending upload
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({}); // { tempId: percentage }
  const [errors, setErrors] = useState([]);
  const fileRef = useRef(null);
  const cameraRef = useRef(null);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setStaged([]);
      setProgress({});
      setErrors([]);
      setUploading(false);
      setTab("sources");
    }
  }, [open]);

  // Paste support
  const validateFiles = (files) => {
    const valid = [];
    const errs = [];
    const remaining = MAX_FILES - staged.length;

    for (const file of files) {
      if (valid.length >= remaining) {
        errs.push(`Max ${MAX_FILES} files per message`);
        break;
      }
      if (!ACCEPTED.includes(file.type)) {
        errs.push(`${file.name}: unsupported type`);
        continue;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        errs.push(`${file.name}: over ${MAX_SIZE_MB}MB`);
        continue;
      }
      valid.push({
        file,
        preview: URL.createObjectURL(file),
        tempId: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        size: file.size,
        name: file.name,
      });
    }
    return { valid, errs };
  };

  const addFiles = useCallback(
    (files) => {
      const { valid, errs } = validateFiles(files);
      setStaged((prev) => [...prev, ...valid]);
      setErrors(errs);
      if (valid.length > 0 && tab !== "sources") setTab("sources");
    },
    [staged, tab]
  );

  useEffect(() => {
    if (!open) return;
    const onPaste = (e) => {
      const files = Array.from(e.clipboardData?.items || [])
        .filter((i) => i.type.startsWith("image/"))
        .map((i) => i.getAsFile())
        .filter(Boolean);
      if (files.length) addFiles(files);
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [open, staged]);



  const removeStaged = (tempId) => {
    setStaged((prev) => {
      const target = prev.find((p) => p.tempId === tempId);
      if (target?.preview) URL.revokeObjectURL(target.preview);
      return prev.filter((p) => p.tempId !== tempId);
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length) addFiles(files);
  };

  const getDimensions = (file) =>
    new Promise((resolve) => {
      const img = new Image();
      img.onload = () =>
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => resolve({});
      img.src = URL.createObjectURL(file);
    });

  const handleUpload = async () => {
    if (staged.length === 0 || uploading) return;
    setUploading(true);
    const uploaded = [];

    for (let i = 0; i < staged.length; i++) {
      const item = staged[i];
      // Fake progress: animate to 90% while uploading, jump to 100% on complete
      setProgress((p) => ({ ...p, [item.tempId]: 10 }));

      const dims = await getDimensions(item.file);
      const { data, error } = await uploadMedia(item.file, dims);

      if (error) {
        setErrors((prev) => [...prev, `${item.name}: ${error}`]);
        setProgress((p) => ({ ...p, [item.tempId]: -1 })); // -1 = error
        continue;
      }

      setProgress((p) => ({ ...p, [item.tempId]: 100 }));
      uploaded.push(data);
    }

    setUploading(false);

    if (uploaded.length > 0) {
      onPick?.(uploaded.length === 1 ? uploaded[0] : uploaded);
      onClose?.();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60]"
            style={{
              background: "rgba(0,0,0,0.7)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
            onClick={uploading ? undefined : onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 32 }}
            className="fixed inset-x-0 bottom-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg z-[60] rounded-t-3xl md:rounded-3xl safe-bottom max-h-[92vh] overflow-hidden flex flex-col"
            style={{
              background:
                "linear-gradient(180deg, rgba(22,18,35,0.98) 0%, rgba(14,11,24,0.98) 100%)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 -20px 60px rgba(0,0,0,0.5)",
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--brand) 0%, var(--violet) 100%)",
                  }}
                >
                  <ImageIcon className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-warm font-semibold text-[17px]">
                  {staged.length > 0
                    ? `${staged.length} file${staged.length > 1 ? "s" : ""} selected`
                    : "Choose media"}
                </h2>
              </div>
              <button
                onClick={onClose}
                disabled={uploading}
                className="p-2 -m-2 rounded-full hover:bg-white/5 disabled:opacity-30"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-warm-mute" />
              </button>
            </div>

            {/* Tabs (only when no staged files) */}
            {staged.length === 0 && (
              <div className="flex gap-1 px-6 pt-3">
                {[
                  { id: "sources", label: "Sources" },
                  { id: "library", label: "Library" },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className="relative px-4 py-3 text-sm font-medium transition-colors"
                    style={{
                      color:
                        tab === t.id ? "#fff" : "rgba(240,240,245,0.5)",
                    }}
                  >
                    {t.label}
                    {tab === t.id && (
                      <motion.div
                        layoutId="media-tab-underline"
                        className="absolute bottom-0 left-0 right-0 h-[2px]"
                        style={{
                          background:
                            "linear-gradient(90deg, var(--brand) 0%, var(--violet) 100%)",
                        }}
                      />
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {staged.length === 0 && tab === "sources" && (
                <div className="space-y-3">
                  <SourceButton
                    icon={Upload}
                    title="Choose from device"
                    subtitle="Photos, files, or desktop"
                    onClick={() => fileRef.current?.click()}
                    accent="linear-gradient(135deg, var(--brand) 0%, var(--violet) 100%)"
                  />
                  <SourceButton
                    icon={Camera}
                    title="Take a photo"
                    subtitle="Open mobile camera"
                    onClick={() => cameraRef.current?.click()}
                    accent="linear-gradient(135deg, var(--violet) 0%, var(--accent) 100%)"
                  />
                  <div
                    className="rounded-2xl p-8 flex flex-col items-center justify-center gap-3 transition-all duration-200"
                    style={{
                      border: dragActive
                        ? "2px dashed var(--brand)"
                        : "2px dashed rgba(255,255,255,0.10)",
                      background: dragActive
                        ? "rgba(251, 113, 133,0.06)"
                        : "transparent",
                      transform: dragActive ? "scale(1.01)" : "scale(1)",
                    }}
                  >
                    <motion.div
                      animate={{ y: dragActive ? -4 : 0 }}
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ background: "rgba(255,255,255,0.05)" }}
                    >
                      <Clipboard className="w-5 h-5 text-warm-mute" />
                    </motion.div>
                    <p className="text-xs text-warm-mute text-center leading-relaxed">
                      Drag a file here
                      <br />
                      or paste with <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[10px]">Ctrl+V</kbd>
                    </p>
                  </div>

                  <input
                    ref={fileRef}
                    type="file"
                    multiple
                    accept={ACCEPTED.join(",")}
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) addFiles(Array.from(e.target.files));
                      e.target.value = "";
                    }}
                  />
                  <input
                    ref={cameraRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0])
                        addFiles([e.target.files[0]]);
                      e.target.value = "";
                    }}
                  />
                </div>
              )}

              {staged.length === 0 && tab === "library" && (
                <>
                  {loading && (
                    <div className="flex items-center justify-center gap-2 text-warm-mute text-sm py-8">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading...
                    </div>
                  )}
                  {!loading && items.length === 0 && (
                    <div className="text-center py-12">
                      <ImageIcon className="w-8 h-8 text-warm-mute mx-auto mb-3" />
                      <p className="text-warm text-sm">No media yet</p>
                      <p className="text-xs text-warm-mute mt-1">
                        Uploaded images will appear here
                      </p>
                    </div>
                  )}
                  {!loading && items.length > 0 && (
                    <div className="grid grid-cols-3 gap-1.5">
                      {items.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => {
                            onPick?.(m);
                            onClose?.();
                          }}
                          className="relative aspect-square overflow-hidden rounded-xl group"
                          style={{
                            border: "1px solid rgba(255,255,255,0.06)",
                          }}
                        >
                          <img
                            src={m.url}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                            <Check className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* Staged previews */}
              {staged.length > 0 && (
                <div className="space-y-3">
                  {errors.length > 0 && (
                    <div
                      className="rounded-xl p-3 flex items-start gap-2"
                      style={{
                        background: "rgba(255,59,48,0.10)",
                        border: "1px solid rgba(255,59,48,0.25)",
                      }}
                    >
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <div className="text-xs text-red-300 space-y-0.5">
                        {errors.map((e, i) => (
                          <div key={i}>{e}</div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    {staged.map((item, idx) => (
                      <motion.div
                        key={item.tempId}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className="relative aspect-square rounded-2xl overflow-hidden group"
                        style={{
                          border: "1px solid rgba(255,255,255,0.08)",
                          background: "rgba(255,255,255,0.03)",
                        }}
                      >
                        <img
                          src={item.preview}
                          alt=""
                          className="w-full h-full object-cover"
                        />

                        {/* Progress overlay */}
                        {progress[item.tempId] !== undefined && (
                          <div
                            className="absolute inset-0 flex items-center justify-center"
                            style={{ background: "rgba(0,0,0,0.6)" }}
                          >
                            {progress[item.tempId] === -1 ? (
                              <AlertCircle className="w-6 h-6 text-red-400" />
                            ) : progress[item.tempId] === 100 ? (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-10 h-10 rounded-full flex items-center justify-center"
                                style={{ background: "var(--accent)" }}
                              >
                                <Check className="w-5 h-5 text-white" />
                              </motion.div>
                            ) : (
                              <div className="text-white text-sm font-semibold">
                                {progress[item.tempId]}%
                              </div>
                            )}
                          </div>
                        )}

                        {/* Remove button */}
                        {!uploading && (
                          <button
                            onClick={() => removeStaged(item.tempId)}
                            className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                            style={{ background: "rgba(0,0,0,0.7)" }}
                            aria-label="Remove"
                          >
                            <X className="w-4 h-4 text-white" />
                          </button>
                        )}

                        {/* File info */}
                        <div
                          className="absolute bottom-0 left-0 right-0 px-3 py-2 text-[10px] text-white/80 truncate"
                          style={{
                            background:
                              "linear-gradient(0deg, rgba(0,0,0,0.8), transparent)",
                          }}
                        >
                          {(item.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                      </motion.div>
                    ))}

                    {/* Add more button */}
                    {staged.length < MAX_FILES && !uploading && (
                      <button
                        onClick={() => fileRef.current?.click()}
                        className="aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 transition-colors hover:bg-white/5"
                        style={{
                          border: "2px dashed rgba(255,255,255,0.12)",
                        }}
                      >
                        <Upload className="w-5 h-5 text-warm-mute" />
                        <span className="text-xs text-warm-mute">
                          Add more
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer actions */}
            {staged.length > 0 && (
              <div
                className="px-6 py-4 flex items-center gap-3 border-t border-white/[0.06]"
                style={{ background: "rgba(0,0,0,0.2)" }}
              >
                <button
                  onClick={() => {
                    setStaged([]);
                    setErrors([]);
                  }}
                  disabled={uploading}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium transition-colors hover:bg-white/5 disabled:opacity-30"
                  style={{ color: "rgba(240,240,245,0.7)" }}
                >
                  Clear
                </button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleUpload}
                  disabled={uploading || staged.length === 0}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-opacity disabled:opacity-50"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--accent) 0%, var(--accent-strong) 100%)",
                    color: "#fff",
                    boxShadow: "0 4px 16px rgba(99, 102, 241, 0.35)",
                  }}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send {staged.length} file{staged.length > 1 ? "s" : ""}
                    </>
                  )}
                </motion.button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function SourceButton({ icon: Icon, title, subtitle, onClick, accent }) {
  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 rounded-2xl transition-colors text-left"
      style={{ border: "1px solid rgba(255,255,255,0.06)" }}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: accent }}
      >
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="min-w-0">
        <div className="text-warm font-medium text-sm">{title}</div>
        <div className="text-xs text-warm-mute">{subtitle}</div>
      </div>
    </motion.button>
  );
}
