import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogOut } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

export default function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user?.user_metadata?.username) setName(user.user_metadata.username);
  }, [user]);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="relative min-h-screen">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center justify-between mb-12">
            <div className="text-label">Profile</div>
            <button
              onClick={handleSignOut}
              className="text-warm-mute hover:text-warm text-sm flex items-center gap-2 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>

          <div className="flex items-center gap-5 mb-12">
            <div
              className="flex items-center justify-center shrink-0"
              style={{
                width: 80,
                height: 80,
                borderRadius: 24,
                background: "linear-gradient(120deg, #ff6ec7 0%, #a855f7 50%, #3b82f6 100%)",
                boxShadow: "0 16px 50px rgba(168, 85, 247, 0.35)",
              }}
            >
              <span style={{ fontFamily: '"Space Grotesk", Inter, sans-serif', fontSize: 34, fontWeight: 800, color: "#fff" }}>
                {(name || "U")[0].toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <h1 className="display-lg mb-1 truncate">
                {name || "Your profile"}
              </h1>
              <p className="text-warm-dim text-sm truncate">{user?.email}</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-8">
            <div>
              <label className="text-label block mb-3">Display name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full bg-transparent border-0 border-b border-white/15 focus:border-iri-pink pb-3 text-warm placeholder:text-warm-mute outline-none transition-colors"
              />
            </div>

            <div>
              <label className="text-label block mb-3">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell people about yourself..."
                rows={3}
                className="w-full bg-transparent border-0 border-b border-white/15 focus:border-iri-pink pb-3 text-warm placeholder:text-warm-mute outline-none transition-colors resize-none"
              />
            </div>

            <button type="submit" className="btn-primary">
              {saved ? "Saved!" : "Save changes"}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
