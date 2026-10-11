import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Mail, Loader2 } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const RESEND_COOLDOWN = 30;
const OTP_LENGTH = 6;

export default function Login() {
  const { sendMagicLink, verifyOtp } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState("email"); // "email" | "otp"
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const inputsRef = useRef([]);

  // Cooldown timer for resend
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  // Focus first OTP input when entering step
  useEffect(() => {
    if (step === "otp") {
      setTimeout(() => inputsRef.current[0]?.focus(), 100);
    }
  }, [step]);

  const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

  const handleSendCode = async (e) => {
    e?.preventDefault();
    setError("");
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    const { error: err } = await sendMagicLink(email.trim().toLowerCase());
    setLoading(false);
    if (err) {
      setError(err.message || "Could not send code. Try again.");
      return;
    }
    setStep("otp");
    setCooldown(RESEND_COOLDOWN);
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setError("");
    setLoading(true);
    const { error: err } = await sendMagicLink(email.trim().toLowerCase());
    setLoading(false);
    if (err) setError(err.message || "Could not resend code.");
    else setCooldown(RESEND_COOLDOWN);
  };

  const handleVerify = async (code) => {
    setError("");
    setLoading(true);
    const { error: err } = await verifyOtp(email.trim().toLowerCase(), code);
    setLoading(false);
    if (err) {
      setError(err.message || "Invalid or expired code.");
      setOtp(Array(OTP_LENGTH).fill(""));
      inputsRef.current[0]?.focus();
      return;
    }
    navigate("/");
  };

  const handleOtpChange = (idx, value) => {
    const v = value.replace(/\D/g, "").slice(0, 1);
    const next = [...otp];
    next[idx] = v;
    setOtp(next);
    if (v && idx < OTP_LENGTH - 1) inputsRef.current[idx + 1]?.focus();
    // Auto-submit when complete
    if (next.every((d) => d !== "") && next.join("").length === OTP_LENGTH) {
      setTimeout(() => handleVerify(next.join("")), 150);
    }
  };

  const handleOtpKeyDown = (idx, e) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && idx > 0) inputsRef.current[idx - 1]?.focus();
    if (e.key === "ArrowRight" && idx < OTP_LENGTH - 1) inputsRef.current[idx + 1]?.focus();
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const text = (e.clipboardData.getData("text") || "").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!text) return;
    const next = Array(OTP_LENGTH).fill("");
    for (let i = 0; i < text.length; i++) next[i] = text[i];
    setOtp(next);
    const nextEmpty = next.findIndex((d) => d === "");
    if (nextEmpty === -1) setTimeout(() => handleVerify(next.join("")), 150);
    else inputsRef.current[nextEmpty]?.focus();
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        {/* Logo / heading */}
        <div className="mb-10">
          <h1 className="display-lg mb-2">
            Welcome <span className="gradient-text">back</span>
          </h1>
          <p className="text-warm-mute text-[15px]">
            {step === "email"
              ? "Sign in with your email — we'll send you a code."
              : `We sent a 6-digit code to ${email}`}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === "email" ? (
            <motion.form
              key="email"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleSendCode}
              className="space-y-5"
            >
              <div>
                <label className="text-label block mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-0 top-[6px] w-4 h-4 text-warm-mute pointer-events-none" strokeWidth={2} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                    autoFocus
                    inputMode="email"
                    disabled={loading}
                    className="w-full bg-transparent border-0 border-b border-white/15 focus:border-iri-pink pl-6 pb-3 text-warm placeholder:text-warm-mute outline-none transition-colors disabled:opacity-50"
                  />
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[13px] text-red-400"
                  role="alert"
                >
                  {error}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending…
                  </>
                ) : (
                  "Send code"
                )}
              </button>
            </motion.form>
          ) : (
            <motion.div
              key="otp"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              <div
                className="flex items-center justify-between gap-2"
                onPaste={handleOtpPaste}
              >
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (inputsRef.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete={idx === 0 ? "one-time-code" : "off"}
                    maxLength={1}
                    value={digit}
                    disabled={loading}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    onFocus={(e) => e.target.select()}
                    className="w-11 h-14 text-center text-[22px] font-semibold bg-transparent border-0 border-b-2 border-white/15 focus:border-iri-pink text-warm outline-none transition-colors disabled:opacity-50"
                    aria-label={`Digit ${idx + 1}`}
                  />
                ))}
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[13px] text-red-400"
                  role="alert"
                >
                  {error}
                </motion.div>
              )}

              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => { setStep("email"); setOtp(Array(OTP_LENGTH).fill("")); setError(""); }}
                  disabled={loading}
                  className="pill-ghost inline-flex items-center gap-1.5 disabled:opacity-50"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Change email
                </button>

                <button
                  type="button"
                  onClick={handleResend}
                  disabled={loading || cooldown > 0}
                  className="text-[13px] font-medium text-warm-mute hover:text-warm transition-colors disabled:opacity-50"
                >
                  {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-[13px] text-warm-mute mt-8 text-center">
          New here?{" "}
          <Link to="/signup" className="text-iri-pink font-medium hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
