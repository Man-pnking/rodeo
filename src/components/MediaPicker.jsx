import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Camera, Upload, Image as ImageIcon, Clipboard, Check, Trash2 } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useMedia } from "../hooks/useMedia";

export default function MediaPicker({ open, onClose, onPick }) {
  const { user } = useAuth();
  const { items, loading, uploadMedia, deleteMedia } = useMedia(user?.id);
  const [tab, setTab] = useState("sources");
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onPaste = async (e) => {
      const files = Array.from(e.clipboardData?.items || [])
        .filter((i) => i.type.startsWith("image/"))
        .map((i) => i.getAsFile())
        .filter(Boolean);
      if (files.length) await handleFiles(files);
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [open]);

  const getDimensions = (file) =>
    new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => resolve({});
      img.src = URL.createObjectURL(file);
    });

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;
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
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length) handleFiles(files);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60]"
            style={{ background: "rgba(0,0,0,0.85)" }}
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-0 bottom-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg z-[60] rounded-t-3xl md:rounded-3xl safe-bottom max-h-[90vh] overflow-hidden flex flex-col"
            style={{ background: "var(--bg-soft)", border: "1px solid rgba(255,255,255,0.08)" }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/8">
              <h2 className="display-md">Choose media</h2>
              <button onClick={onClose} className="p-2 -m-2" aria-label="Close">
                <X className="w-5 h-5 text-warm-mute" />
              </button>
            </div>

            <div className="flex gap-1 px-6 pt-4">
              {[
                { id: "sources", label: "Sources" },
                { id: "library", label: "Library" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className="relative px-4 py-3 text-sm font-medium transition-colors"
                  style={{ color: tab === t.id ? "#fff" : "rgba(240,240,245,0.5)" }}
                >
                  {t.label}
                  {tab === t.id && (
                    <motion.div
                      layoutId="media-tab-underline"
                      className="absolute bottom-0 left-0 right-0 h-[2px]"
                      style={{ background: "linear-gradient(90deg, #ff6ec7 0%, #a855f7 100%)" }}
                    />
                  )}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {tab === "sources" && (
                <div className="space-y-3">
                  <SourceButton
                    icon={Upload}
                    title="Choose from device"
                    subtitle="Photos, files, or desktop"
                    onClick={() => fileRef.current?.click()}
                    accent="linear-gradient(135deg, #ff6ec7 0%, #a855f7 100%)"
                  />
                  <SourceButton
                    icon={Camera}
                    title="Take a photo"
                    subtitle="Mobile camera"
                    onClick={() => cameraRef.current?.click()}
                    accent="linear-gradient(135deg, #a855f7 0%, #3b82f6 100%)"
                  />
                  <div
                    className="rounded-2xl p-6 flex flex-col items-center justify-center gap-2 transition-colors"
                    style={{
                      border: dragActive
                        ? "2px dashed #ff6ec7"
                        : "2px dashed rgba(255,255,255,0.12)",
                      background: dragActive ? "rgba(255,110,199,0.05)" : "transparent",
                    }}
                  >
                    <Clipboard className="w-6 h-6 text-warm-mute" />
                    <p className="text-xs text-warm-mute text-center">
                      Drag a file here or paste with Ctrl+V
                    </p>
                  </div>

                  <input
                    ref={fileRef}
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={(e) => e.target.files && handleFiles(Array.from(e.target.files))}
                  />
                  <input
                    ref={cameraRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                  />
                </div>
              )}

              {tab === "library" && (
                <>
                  {loading && (
                    <div className="text-center text-warm-mute text-sm py-8">Loading...</div>
                  )}
                  {!loading && items.length === 0 && (
                    <div className="text-center py-12">
                      <ImageIcon className="w-8 h-8 text-warm-mute mx-auto mb-3" />
                      <p className="text-body text-sm">No media yet.</p>
                      <p className="text-xs text-warm-mute mt-1">
                        Upload something — it'll show here.
                      </p>
                    </div>
                  )}
                  {!loading && items.length > 0 && (
                    <div className="grid grid-cols-3 gap-1">
                      {items.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => {
                            onPick?.(m);
                            onClose?.();
                          }}
                          className="relative aspect-square overflow-hidden group"
                        >
                          <img
                            src={m.url}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                            <Check className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {uploading && (
              <div className="px-6 py-4 border-t border-white/8 text-center text-sm text-iri-pink">
                Uploading...
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
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 rounded-2xl transition-colors hover:bg-white/[0.03] text-left"
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
    </button>
  );
}
