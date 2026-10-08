import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, X, Image as ImageIcon } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useMedia } from "../hooks/useMedia";
import SlideIn from "../components/SlideIn.jsx";

export default function Library() {
  const { user } = useAuth();
  const { items, loading, deleteMedia } = useMedia(user?.id);
  const [preview, setPreview] = useState(null);

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <SlideIn variant="up">
        <h1 className="display-lg mb-2">Library</h1>
        <p className="text-body mb-8">Your uploaded photos.</p>
      </SlideIn>

      {loading && (
        <div className="text-center py-16 text-warm-mute text-sm">Loading...</div>
      )}

      {!loading && items.length === 0 && (
        <div className="text-center py-16">
          <ImageIcon className="w-10 h-10 text-warm-mute mx-auto mb-4" />
          <h3 className="display-md mb-2 text-warm">No media yet</h3>
          <p className="text-body">Photos you upload to posts or statuses will appear here.</p>
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
          {items.map((m) => (
            <button
              key={m.id}
              onClick={() => setPreview(m)}
              className="relative aspect-square overflow-hidden rounded-lg group"
            >
              <img
                src={m.url}
                alt=""
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {preview && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-6"
              style={{ background: "rgba(0,0,0,0.92)" }}
              onClick={() => setPreview(null)}
            >
              <button
                onClick={() => setPreview(null)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center z-10 safe-top"
                style={{ background: "rgba(255,255,255,0.1)" }}
              >
                <X className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteMedia(preview);
                  setPreview(null);
                }}
                className="absolute top-4 left-4 w-10 h-10 rounded-full flex items-center justify-center z-10 safe-top"
                style={{ background: "rgba(239,68,68,0.25)" }}
              >
                <Trash2 className="w-5 h-5 text-red-400" />
              </button>
              <motion.img
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                src={preview.url}
                alt=""
                className="max-w-full max-h-full object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
