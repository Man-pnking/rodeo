import { useState, useRef } from "react";
import { Image as ImageIcon, X, Send } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import { useProfile } from "../hooks/useProfile";
import { useFeed } from "../hooks/useFeed";

export default function Composer({ onPosted }) {
  const { user } = useAuth();
  const { profile } = useProfile(user?.id);
  const { createPost } = useFeed(user?.id);
  const [body, setBody] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [posting, setPosting] = useState(false);
  const fileRef = useRef(null);

  const pickImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setImageFile(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const submit = async () => {
    if (!body.trim() && !imageFile) return;
    setPosting(true);

    let imageUrl = null;
    if (imageFile) {
      const ext = imageFile.name.split(".").pop();
      const path = `${user.id}/post-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("posts").upload(path, imageFile);
      if (!upErr) {
        const { data: pub } = supabase.storage.from("posts").getPublicUrl(path);
        imageUrl = pub.publicUrl;
      }
    }

    const { error } = await createPost(body, imageUrl);
    setPosting(false);

    if (!error) {
      setBody("");
      clearImage();
      onPosted?.();
    }
  };

  const canPost = (body.trim() || imageFile) && !posting;

  return (
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

          {preview && (
            <div className="relative mt-3 rounded-2xl overflow-hidden">
              <img src={preview} alt="" className="w-full max-h-96 object-cover" />
              <button
                onClick={clearImage}
                className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: "rgba(0,0,0,0.6)" }}
                aria-label="Remove image"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/8">
            <div className="flex items-center gap-2">
              <button
                onClick={() => fileRef.current?.click()}
                className="p-2 -m-2 rounded-full hover:bg-white/5 transition-colors"
                aria-label="Add image"
              >
                <ImageIcon className="w-5 h-5 text-iri-pink" />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={pickImage}
              />
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
  );
}
