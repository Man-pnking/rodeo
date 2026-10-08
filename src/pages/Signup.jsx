import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

export default function Signup() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (!/^[a-z0-9_]{3,20}$/.test(username)) {
      setError("Username: 3-20 chars, lowercase, numbers, or underscore.");
      return;
    }

    setLoading(true);
    const { error } = await signUp(email, password, { data: { username } });
    setLoading(false);

    if (error) setError(error.message);
    else navigate("/");
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm"
      >
        <div className="mb-12">
          <h1 className="display-lg mb-2">
            Join <span className="gradient-text">Rodeo</span>
          </h1>
          <p className="text-body">Create an account in seconds.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-label block mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              placeholder="yourname"
              required
              autoComplete="username"
              className="w-full bg-transparent border-0 border-b border-white/15 focus:border-iri-pink pb-3 text-warm placeholder:text-warm-mute outline-none transition-colors"
            />
          </div>

          <div>
            <label className="text-label block mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              className="w-full bg-transparent border-0 border-b border-white/15 focus:border-iri-pink pb-3 text-warm placeholder:text-warm-mute outline-none transition-colors"
            />
          </div>

          <div>
            <label className="text-label block mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              required
              autoComplete="new-password"
              className="w-full bg-transparent border-0 border-b border-white/15 focus:border-iri-pink pb-3 text-warm placeholder:text-warm-mute outline-none transition-colors"
            />
          </div>

          {error && <div className="text-sm text-red-400 pt-2">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 mt-4"
          >
            {loading ? "Creating..." : "Create account"}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>

          <p className="text-center text-sm text-warm-dim pt-2">
            Already have an account?{" "}
            <Link to="/login" className="text-iri-pink hover:text-iri-purple transition-colors font-medium">
              Sign in
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
