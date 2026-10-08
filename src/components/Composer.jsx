import { useState } from "react";
import { Image as ImageIcon, X, Send } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import { useProfile } from "../hooks/useProfile";
import { useFeed } from "../hooks/useFeed";
import MediaPicker from "./MediaPicker.jsx";

export default function Composer({ onPosted }) {
  const { user } = useAuth();
  const { profile } = useProfile(user?.id);
  const { createPost } = useFeed(user?.id);
  const [body, setBody] = useState("");
  const [images, setImages] = useState([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [posting, setPosting] = useState(false);

  const submit = async () => {
    if (!body.trim() && !image) return;
    setPosting(true);
    const { error } = await createPost(body, images.map(i => i.url));
    setPosting(false);
    if (!error) {
      setBody("");
      setImages([]);
      onPosted?.();
    }
  };

  const canPost = (body.trim() || images.length > 0) && !posting;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full"
      >
        <div className="flex gap-4">
          <div
            className="w-11 h-11 rounded-full shrink-0"
            style={{
              background: profile?.avatar_url
                ? `url(${profile.avatar_url}) center/cover`
                : "linear-gradient(135deg, #ff6ec7 0%, #a855f7 100%)",
            }}
          />
          <div className="flex-1 min-w-0">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value.slice(0, 500))}
              placeholder="What's on your mind?"
              rows={3}
              className="w-full bg-transparent border-0 text-warm placeholder:text-warm-mute outline-none resize-none text-base"
            />

            {images.length > 0 && (
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
            )}

            <div className="flex items-center justify-between mt-4 pt-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPickerOpen(true)}
                  className="p-2 -m-2 rounded-full hover:bg-white/5 transition-colors"
                  aria-label="Add image"
                >
                  <ImageIcon className="w-5 h-5 text-iri-pink" />
                </button>
                <span className="text-xs text-warm-mute">{body.length}/500</span>
              </div>

              <button
                onClick={submit}
                disabled={!canPost}
                className="btn-primary flex items-center gap-2 px-5 py-2 text-sm"
              >
                <Send className="w-3.5 h-3.5" />
                {posting ? "Posting..." : "Post"}
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={(media) => {
          const arr = Array.isArray(media) ? media : [media];
          setImages((prev) => [...prev, ...arr]);
        }}
      />
    </>
  );
}
