import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SlideIn from "../components/SlideIn.jsx";
import { ArrowRight } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) setError(error.message);
    else navigate("/");
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <SlideIn variant="up"><div className="mb-12">
          <h1 className="display-lg mb-2">
            Welcome <span className="gradient-text">back</span>
          </h1>
          <p className="text-body">Sign in to continue to Rodeo.</p>
        </div></SlideIn>

        <SlideIn variant="up" delay={0.12}><form onSubmit={handleSubmit} className="space-y-6">
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
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className="w-full bg-transparent border-0 border-b border-white/15 focus:border-iri-pink pb-3 text-warm placeholder:text-warm-mute outline-none transition-colors"
            />
          </div>

          {error && <div className="text-sm text-red-400 pt-2">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 mt-4"
          >
            {loading ? "Signing in..." : "Sign in"}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>

          <p className="text-center text-sm text-warm-dim pt-2">
            Don't have an account?{" "}
            <Link to="/signup" className="text-iri-pink hover:text-iri-purple transition-colors font-medium">
              Sign up
            </Link>
          </p>
        </form></SlideIn>
      </div>
    </div>
  );
}
