import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Mail,
  Loader2,
  Check,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import WorldMap from "../components/WorldMap.jsx";

const RESEND_COOLDOWN = 30;
const OTP_LENGTH = 8;

export default function Signup() {
  const { sendMagicLink, verifyOtp } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState("email"); // "email" | "otp"
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const otpRef = useRef(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  useEffect(() => {
    if (step === "otp") setTimeout(() => otpRef.current?.focus(), 100);
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

  const handleVerify = async (e) => {
    e?.preventDefault();
    setError("");
    const cleaned = otp.replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (cleaned.length !== OTP_LENGTH) {
      setError(`Enter the ${OTP_LENGTH}-digit code from your email.`);
      return;
    }
    setLoading(true);
    const { error: err } = await verifyOtp(email.trim().toLowerCase(), cleaned);
    setLoading(false);
    if (err) {
      setError(err.message || "Invalid or expired code.");
      setOtp("");
      otpRef.current?.focus();
      return;
    }
    navigate("/");
  };

  const goBack = () => {
    setStep("email");
    setOtp("");
    setError("");
  };

  return (
    <div
      className="relative min-h-screen w-full"
      style={{ background: "var(--bg)", color: "var(--text-primary)" }}
    >
      {/* ==================================================== */}
      {/* DESKTOP (md+): split screen                          */}
      {/* ==================================================== */}
      <div className="hidden md:grid md:grid-cols-2 min-h-screen w-full">
        {/* LEFT — WorldMap + brand copy */}
        <aside
          className="relative flex flex-col justify-between overflow-hidden"
          style={{
            background:
              "radial-gradient(ellipse at 30% 30%, var(--accent-soft) 0%, var(--bg) 70%)",
            borderRight: "1px solid var(--border)",
          }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.9 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 pointer-events-none"
            style={{
              WebkitMaskImage:
                "radial-gradient(ellipse at 50% 40%, black 40%, transparent 85%)",
              maskImage:
                "radial-gradient(ellipse at 50% 40%, black 40%, transparent 85%)",
            }}
          >
            <WorldMap dotColor="#2AA5B0" activeColor="#3B7BFF" animateHotSpots />
          </motion.div>

          <div className="relative z-10 p-12 flex flex-col h-full justify-between">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div
                className="text-[12px] font-semibold uppercase mb-6"
                style={{ color: "var(--accent)", letterSpacing: "0.15em" }}
              >
                Rodeo
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25 }}
              className="max-w-md"
            >
              <h2
                className="text-[38px] font-bold leading-[1.1] mb-4"
                style={{
                  color: "var(--text-primary)",
                  letterSpacing: "-0.028em",
                }}
              >
                Meet the world,
                <br />
                one chat at a time.
              </h2>
              <p
                className="text-[15px] leading-[1.6]"
                style={{ color: "var(--text-secondary)" }}
              >
                Discover friends near you and around the world. No feed, no
                noise — just messaging.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex items-center gap-3"
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{
                  background: "var(--accent-soft)",
                  color: "var(--accent)",
                }}
              >
                <Sparkles className="w-4 h-4" strokeWidth={2} />
              </div>
              <p
                className="text-[13px]"
                style={{ color: "var(--text-tertiary)" }}
              >
                Join thousands worldwide
              </p>
            </motion.div>
          </div>
        </aside>

        {/* RIGHT — Form */}
        <main className="relative flex flex-col justify-center px-16 lg:px-20 py-12">
          <FormBody
            step={step}
            email={email}
            setEmail={setEmail}
            otp={otp}
            setOtp={setOtp}
            error={error}
            loading={loading}
            cooldown={cooldown}
            otpRef={otpRef}
            onSubmitEmail={handleSendCode}
            onSubmitOtp={handleVerify}
            onResend={handleResend}
            onBack={goBack}
          />
        </main>
      </div>

      {/* ==================================================== */}
      {/* MOBILE (< md): onboarding-style slide                */}
      {/* ==================================================== */}
      <div className="md:hidden relative min-h-screen w-full overflow-hidden flex flex-col">
        {/* Full-bleed WorldMap behind */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.85 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-x-0 top-0 pointer-events-none"
          style={{
            height: "65%",
            WebkitMaskImage:
              "linear-gradient(180deg, black 60%, transparent 100%)",
            maskImage:
              "linear-gradient(180deg, black 60%, transparent 100%)",
          }}
        >
          <WorldMap dotColor="#2AA5B0" activeColor="#3B7BFF" animateHotSpots />
        </motion.div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bottom sheet */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full"
          style={{
            background: "var(--bg)",
            borderRadius: "32px 32px 0 0",
            padding: "32px 24px calc(env(safe-area-inset-bottom, 0) + 32px)",
            boxShadow: "0 -20px 60px rgba(0, 0, 0, 0.08)",
            borderTop: "1px solid var(--border)",
          }}
        >
          <div className="w-full max-w-md mx-auto">
            <FormBody
              step={step}
              email={email}
              setEmail={setEmail}
              otp={otp}
              setOtp={setOtp}
              error={error}
              loading={loading}
              cooldown={cooldown}
              otpRef={otpRef}
              onSubmitEmail={handleSendCode}
              onSubmitOtp={handleVerify}
              onResend={handleResend}
              onBack={goBack}
              mobile
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ============================================================
// Shared form body — used by both desktop (right panel) and
// mobile (bottom sheet). `mobile` prop tweaks sizing.
// ============================================================
function FormBody({
  step,
  email,
  setEmail,
  otp,
  setOtp,
  error,
  loading,
  cooldown,
  otpRef,
  onSubmitEmail,
  onSubmitOtp,
  onResend,
  onBack,
  mobile = false,
}) {
  const headerSize = mobile
    ? "text-[26px] sm:text-[30px]"
    : "text-[30px]";

  return (
    <div className="w-full max-w-sm mx-auto">
      <AnimatePresence mode="wait">
        {step === "email" ? (
          <motion.form
            key="email"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            onSubmit={onSubmitEmail}
            className="space-y-6"
          >
            <header>
              <div
                className="text-[11px] font-semibold uppercase mb-3"
                style={{ color: "var(--accent)", letterSpacing: "0.15em" }}
              >
                01 · Sign up
              </div>
              <h1
                className={`${headerSize} font-bold leading-[1.15] mb-2`}
                style={{
                  color: "var(--text-primary)",
                  letterSpacing: "-0.022em",
                }}
              >
                What's your email?
              </h1>
              <p
                className="text-[15px] leading-[1.6]"
                style={{ color: "var(--text-secondary)" }}
              >
                We'll send you an {OTP_LENGTH}-digit code to sign in. No
                password needed.
              </p>
            </header>

            <div className="relative">
              <Mail
                className="absolute left-5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] pointer-events-none"
                strokeWidth={2}
                style={{ color: "var(--text-tertiary)" }}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                autoFocus
                inputMode="email"
                disabled={loading}
                className="w-full pl-12 pr-5 py-3.5 rounded-2xl text-[15px] font-medium outline-none transition-colors disabled:opacity-50"
                style={{
                  background: "var(--bg-soft)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border)",
                  caretColor: "var(--accent)",
                }}
                onFocus={(e) =>
                  (e.target.style.borderColor = "var(--accent)")
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = "var(--border)")
                }
              />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[13px]"
                style={{ color: "var(--danger)" }}
                role="alert"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full py-3.5 rounded-full font-semibold text-[15px] flex items-center justify-center gap-2 transition-all disabled:opacity-40"
              style={{
                background: "var(--accent)",
                color: "var(--accent-fg)",
                boxShadow: "0 8px 24px rgba(59, 123, 255, 0.28)",
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending…
                </>
              ) : (
                <>
                  Send code
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </motion.form>
        ) : (
          <motion.form
            key="otp"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            onSubmit={onSubmitOtp}
            className="space-y-6"
          >
            <header className="text-center">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-full mx-auto mb-5"
                style={{ background: "var(--accent-soft)" }}
              >
                <Mail className="w-7 h-7" style={{ color: "var(--accent)" }} />
              </motion.div>

              <div
                className="text-[11px] font-semibold uppercase mb-3"
                style={{ color: "var(--accent)", letterSpacing: "0.15em" }}
              >
                02 · Verify
              </div>
              <h1
                className={`${headerSize} font-bold leading-[1.15] mb-2`}
                style={{
                  color: "var(--text-primary)",
                  letterSpacing: "-0.022em",
                }}
              >
                Enter your code
              </h1>
              <p
                className="text-[15px] leading-[1.6]"
                style={{ color: "var(--text-secondary)" }}
              >
                We sent an {OTP_LENGTH}-digit code to
                <br />
                <span
                  style={{ color: "var(--text-primary)", fontWeight: 600 }}
                >
                  {email}
                </span>
              </p>
            </header>

            <input
              ref={otpRef}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="one-time-code"
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, "").slice(0, OTP_LENGTH))
              }
              placeholder={"0".repeat(OTP_LENGTH)}
              maxLength={OTP_LENGTH}
              disabled={loading}
              className="w-full px-5 py-4 rounded-2xl text-[22px] font-bold outline-none text-center transition-colors disabled:opacity-50"
              style={{
                background: "var(--bg-soft)",
                color: "var(--text-primary)",
                border: "1px solid var(--border)",
                letterSpacing: "0.4em",
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                caretColor: "var(--accent)",
              }}
              onFocus={(e) =>
                (e.target.style.borderColor = "var(--accent)")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = "var(--border)")
              }
            />

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[13px] text-center"
                style={{ color: "var(--danger)" }}
                role="alert"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={loading || otp.length !== OTP_LENGTH}
              className="w-full py-3.5 rounded-full font-semibold text-[15px] flex items-center justify-center gap-2 transition-all disabled:opacity-40"
              style={{
                background: "var(--accent)",
                color: "var(--accent-fg)",
                boxShadow: "0 8px 24px rgba(59, 123, 255, 0.28)",
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying…
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" strokeWidth={2.5} />
                  Verify
                </>
              )}
            </button>

            <div className="flex items-center justify-between text-[13px]">
              <button
                type="button"
                onClick={onBack}
                disabled={loading}
                className="inline-flex items-center gap-1.5 font-medium transition-colors disabled:opacity-50"
                style={{ color: "var(--text-secondary)" }}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Change email
              </button>

              <button
                type="button"
                onClick={onResend}
                disabled={loading || cooldown > 0}
                className="font-medium transition-colors disabled:opacity-50"
                style={{ color: "var(--text-secondary)" }}
              >
                {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <p
        className="text-[13px] mt-8 text-center"
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
    </div>
  );
}
