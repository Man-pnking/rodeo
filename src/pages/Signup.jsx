import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Mail, Check } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

export default function Signup() {
  const { sendMagicLink } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    const { error } = await sendMagicLink(email);
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }
    setSentTo(email);
  };

  const handleResend = async () => {
    setLoading(true);
    await sendMagicLink(email);
    setLoading(false);
  };

  // ===== Check email screen =====
  if (sentTo) {
    return (
      <div className="relative min-h-screen flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-sm text-center"
        >
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-full mx-auto mb-6"
            style={{ background: "var(--accent-soft)" }}
          >
            <Mail className="w-7 h-7" style={{ color: "var(--accent)" }} />
          </div>

          <h1
            className="text-[24px] font-bold tracking-tight mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            Check your email
          </h1>

          <p
            className="text-[14px] leading-relaxed mb-6"
            style={{ color: "var(--text-secondary)" }}
          >
            We sent a magic link to
            <br />
            <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>
              {sentTo}
            </span>
          </p>

          <p
            className="text-[13px] leading-relaxed mb-8"
            style={{ color: "var(--text-tertiary)" }}
          >
            Tap the link in the email to sign in. You'll be brought back to
            Rodeo automatically.
          </p>

          <button
            onClick={handleResend}
            disabled={loading}
            className="w-full py-3.5 rounded-full font-semibold text-[15px] disabled:opacity-40"
            style={{
              background: "var(--bg-soft)",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
            }}
          >
            {loading ? "Sending..." : "Resend email"}
          </button>

          <button
            onClick={() => {
              setSentTo(null);
              setEmail("");
            }}
            className="w-full py-3 mt-2 text-sm font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            Use a different email
          </button>

          <p className="text-sm mt-8" style={{ color: "var(--text-tertiary)" }}>
            Already verified?{" "}
            <Link
              to="/login"
              className="font-medium hover:underline"
              style={{ color: "var(--accent)" }}
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    );
  }

  // ===== Email input screen =====
  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm"
      >
        <div className="mb-10">
          <h1
            className="text-[28px] font-bold tracking-tight mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            Join Rodeo
          </h1>
          <p className="text-[14px]" style={{ color: "var(--text-secondary)" }}>
            Enter your email — we'll send you a magic link to sign in. No
            password needed.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              className="block text-[12px] font-semibold uppercase mb-2"
              style={{ color: "var(--text-tertiary)", letterSpacing: "0.08em" }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              autoFocus
              className="w-full px-4 py-3 rounded-xl text-[15px] outline-none transition-colors"
              style={{
                background: "var(--bg-soft)",
                color: "var(--text-primary)",
                border: "1px solid var(--border)",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            />
          </div>

          {error && (
            <p className="text-[13px]" style={{ color: "var(--danger)" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full font-semibold text-[15px] flex items-center justify-center gap-2 mt-4 disabled:opacity-40"
            style={{
              background: "var(--accent)",
              color: "var(--accent-fg)",
              boxShadow: "0 8px 24px rgba(59, 123, 255, 0.28)",
            }}
          >
            {loading ? (
              "Sending..."
            ) : (
              <>
                Send magic link
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <p
            className="text-center text-sm pt-2"
            style={{ color: "var(--text-secondary)" }}
          >
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium hover:underline"
              style={{ color: "var(--accent)" }}
            >
              Sign in
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
