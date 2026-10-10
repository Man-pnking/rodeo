import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  MapPin,
  User as UserIcon,
  Check,
  Camera,
  Loader2,
  Mail,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useProfile } from "../hooks/useProfile";
import { useMedia } from "../hooks/useMedia";
import WorldMap from "./WorldMap.jsx";

const TOTAL_STEPS = 7;
const ONBOARDING_KEY = "rodeo_onboarding_done";

export default function Onboarding({ onComplete }) {
  const { user, sendMagicLink, verifyOtp } = useAuth();
  const { profile, update, refetch } = useProfile(user?.id);
  const { uploadMedia } = useMedia(user?.id);

  const [step, setStep] = useState(() => {
    const saved = localStorage.getItem("rodeo_onboarding_step");
    return saved ? parseInt(saved, 10) : 0;
  });
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [token, setToken] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationLabel, setLocationLabel] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const fileRef = useRef(null);

  // Auto-advance: if user becomes authenticated mid-flow and was on Email/CheckEmail,
  // move them forward to Location
  useEffect(() => {
    if (user && step <= 2) {
      setStep(3);
    }
  }, [user, step]);

  // Pre-fill from existing profile
  useEffect(() => {
    if (profile?.display_name && !name) setName(profile.display_name);
    if (profile?.avatar_url && !avatarUrl) setAvatarUrl(profile.avatar_url);
    if (profile?.location_label && !locationLabel) setLocationLabel(profile.location_label);
  }, [profile]);

  const next = () => {
    setError("");
    if (step < TOTAL_STEPS - 1) setStep((s) => s + 1);
    else finish();
  };

  // Persist step across reloads (needed when user clicks magic link)
  useEffect(() => {
    if (step > 0) {
      localStorage.setItem("rodeo_onboarding_step", String(step));
    }
  }, [step]);

  const back = () => {
    setError("");
    if (step > 0) setStep((s) => s - 1);
  };

  const finish = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    localStorage.removeItem("rodeo_onboarding_step");
    onComplete?.();
  };

  // ---------- Magic link ----------
  const handleSendLink = async () => {
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
    setEmailSent(true);
    next(); // go to CheckEmail slide
  };

  const handleVerify = async () => {
    setError("");
    const cleaned = token.replace(/\D/g, "").slice(0, 8);
    if (cleaned.length !== 8) {
      setError("Enter the 8-digit code from your email.");
      return;
    }
    setVerifying(true);
    const { error } = await verifyOtp(email, cleaned);
    setVerifying(false);
    if (error) {
      setError(error.message || "Invalid or expired code. Try again.");
      return;
    }
    // Success — user is now authenticated, advance to Location
    setStep(3);
  };

  const handleResendLink = async () => {
    setLoading(true);
    await sendMagicLink(email);
    setLoading(false);
  };

  // ---------- Location ----------
  const requestLocation = async () => {
    setError("");
    if (!navigator.geolocation) {
      setError("Location not supported on this device");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        let label = "";
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
          );
          const data = await res.json();
          label = data?.address?.city || data?.address?.town || data?.address?.country || "";
        } catch {
          label = "";
        }
        if (user) {
          await update({
            latitude,
            longitude,
            location_label: label,
            location_updated_at: new Date().toISOString(),
          });
        }
        setLocationLabel(label);
        setLocating(false);
        setTimeout(() => next(), 500);
      },
      () => {
        setLocating(false);
        setError("Location permission denied. You can enable it later in Settings.");
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    );
  };

  // ---------- Avatar ----------
  const handleAvatarPick = async (file) => {
    if (!file) return;
    setUploading(true);
    setError("");
    const dims = await new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => resolve({});
      img.src = URL.createObjectURL(file);
    });
    const { data, error } = await uploadMedia(file, dims);
    setUploading(false);
    if (error) {
      setError(error);
      return;
    }
    setAvatarUrl(data.url);
    if (user) await update({ avatar_url: data.url });
  };

  // ---------- Username ----------
  const saveUsername = async () => {
    const trimmed = name.trim().toLowerCase();
    if (!/^[a-z0-9_]{3,20}$/.test(trimmed)) {
      setError("3–20 characters: lowercase letters, numbers, underscores.");
      return;
    }
    if (user) {
      await update({ display_name: trimmed });
      await refetch();
    }
    next();
  };

  const skipToFinish = () => setStep(TOTAL_STEPS - 1);

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden flex flex-col"
      style={{ background: "var(--bg)" }}
    >
      {/* ===== Map — full bleed, fades in ===== */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.85 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-x-0 top-0 pointer-events-none"
        style={{
          height: "65%",
          WebkitMaskImage: "linear-gradient(180deg, black 60%, transparent 100%)",
          maskImage: "linear-gradient(180deg, black 60%, transparent 100%)",
        }}
      >
        <WorldMap dotColor="#2AA5B0" activeColor="#3B7BFF" animateHotSpots />
      </motion.div>

      {/* ===== Top bar ===== */}
      <div
        className="relative z-20 flex items-center justify-between px-6"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0) + 20px)" }}
      >
        {step > 0 && step !== 2 ? (
          <button
            onClick={back}
            className="text-sm font-medium px-3 py-1.5 rounded-full"
            style={{
              color: "var(--text-secondary)",
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
            }}
          >
            Back
          </button>
        ) : (
          <div />
        )}
        {step < TOTAL_STEPS - 1 && step !== 2 && (
          <button
            onClick={skipToFinish}
            className="text-sm font-medium"
            style={{ color: "var(--text-tertiary)" }}
          >
            Skip
          </button>
        )}
      </div>

      {/* ===== Spacer ===== */}
      <div className="flex-1" />

      {/* ===== Content sheet ===== */}
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
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            >
              {step === 0 && <SlideWelcome onContinue={next} />}
              {step === 1 && (
                <SlideEmail
                  email={email}
                  setEmail={setEmail}
                  loading={loading}
                  error={error}
                  onSend={handleSendLink}
                />
              )}
              {step === 2 && (
                <SlideEnterCode
                  email={email}
                  token={token}
                  setToken={setToken}
                  verifying={verifying}
                  error={error}
                  onVerify={handleVerify}
                  onResend={handleResendLink}
                  onEdit={() => {
                    setStep(1);
                    setEmailSent(false);
                    setToken("");
                    setError("");
                  }}
                />
              )}
              {step === 3 && (
                <SlideLocation
                  locating={locating}
                  locationLabel={locationLabel}
                  error={error}
                  onRequest={requestLocation}
                  onSkip={next}
                />
              )}
              {step === 4 && (
                <SlideUsername
                  name={name}
                  setName={setName}
                  error={error}
                  onContinue={saveUsername}
                />
              )}
              {step === 5 && (
                <SlideAvatar
                  avatarUrl={avatarUrl}
                  uploading={uploading}
                  error={error}
                  onPickAvatar={() => fileRef.current?.click()}
                  onContinue={next}
                />
              )}
              {step === 6 && (
                <SlideReady
                  name={name}
                  locationLabel={locationLabel}
                  onFinish={finish}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === step ? 28 : 6,
                  height: 6,
                  background: i === step ? "var(--accent)" : "var(--border)",
                }}
              />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) handleAvatarPick(e.target.files[0]);
          e.target.value = "";
        }}
      />
    </div>
  );
}

// ============ Shared UI ============
function Eyebrow({ children }) {
  return (
    <div
      className="text-[11px] font-semibold uppercase mb-3"
      style={{ color: "var(--accent)", letterSpacing: "0.15em" }}
    >
      {children}
    </div>
  );
}

function Headline({ children }) {
  return (
    <h1
      className="text-[26px] sm:text-[30px] font-bold tracking-tight leading-[1.15] mb-3"
      style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}
    >
      {children}
    </h1>
  );
}

function Body({ children }) {
  return (
    <p
      className="text-[15px] leading-[1.6] mb-7"
      style={{ color: "var(--text-secondary)" }}
    >
      {children}
    </p>
  );
}

function PrimaryButton({ children, onClick, disabled, loading }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
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
          {children}
        </>
      ) : (
        <>
          {children}
          <ArrowRight className="w-4 h-4" />
        </>
      )}
    </button>
  );
}

// ---------- Slide 1: Welcome ----------
function SlideWelcome({ onContinue }) {
  return (
    <>
      <Eyebrow>Welcome</Eyebrow>
      <Headline>
        Meet the world,
        <br />
        one chat at a time
      </Headline>
      <Body>
        Discover friends near you and around the world. Start conversations
        with people who share your interests — no feed, no noise, just
        messaging.
      </Body>
      <PrimaryButton onClick={onContinue}>Get started</PrimaryButton>
    </>
  );
}

// ---------- Slide 2: Email ----------
function SlideEmail({ email, setEmail, loading, error, onSend }) {
  return (
    <>
      <Eyebrow>01 · Sign up</Eyebrow>
      <Headline>What's your email?</Headline>
      <Body>
        We'll send you a magic link to sign in. No password needed — just
        tap the link in your inbox.
      </Body>

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        autoComplete="email"
        autoFocus
        className="w-full px-5 py-3.5 rounded-2xl text-[15px] font-medium outline-none mb-4 text-center transition-colors"
        style={{
          background: "var(--bg-soft)",
          color: "var(--text-primary)",
          border: "1px solid var(--border)",
        }}
        onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
        onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
        onKeyDown={(e) => e.key === "Enter" && onSend()}
      />

      {error && (
        <p className="text-[13px] mb-3 text-center" style={{ color: "var(--danger)" }}>
          {error}
        </p>
      )}

      <PrimaryButton onClick={onSend} disabled={!email.trim()} loading={loading}>
        Send magic link
      </PrimaryButton>
    </>
  );
}

// ---------- Slide 3: Enter Code ----------
function SlideEnterCode({ email, token, setToken, verifying, error, onVerify, onResend, onEdit }) {
  const digits = token.replace(/\D/g, "").slice(0, 8);

  return (
    <div className="text-center">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="inline-flex items-center justify-center w-16 h-16 rounded-full mx-auto mb-6"
        style={{ background: "var(--accent-soft)" }}
      >
        <Mail className="w-7 h-7" style={{ color: "var(--accent)" }} />
      </motion.div>

      <Eyebrow>02 · Verify</Eyebrow>
      <Headline>Enter your code</Headline>
      <Body>
        We sent an 8-digit code to
        <br />
        <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>
          {email}
        </span>
      </Body>

      <input
        type="text"
        inputMode="numeric"
        value={digits}
        onChange={(e) => setToken(e.target.value.replace(/\D/g, "").slice(0, 8))}
        placeholder="00000000"
        autoComplete="one-time-code"
        autoFocus
        maxLength={8}
        className="w-full px-5 py-4 rounded-2xl text-[22px] font-bold outline-none mb-4 text-center transition-colors"
        style={{
          background: "var(--bg-soft)",
          color: "var(--text-primary)",
          border: "1px solid var(--border)",
          letterSpacing: "0.35em",
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        }}
        onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
        onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
        onKeyDown={(e) => e.key === "Enter" && onVerify()}
      />

      {error && (
        <p className="text-[13px] mb-3 text-center" style={{ color: "var(--danger)" }}>
          {error}
        </p>
      )}

      <PrimaryButton
        onClick={onVerify}
        disabled={digits.length !== 8}
        loading={verifying}
      >
        {verifying ? "Verifying..." : "Verify"}
      </PrimaryButton>

      <button
        onClick={onResend}
        className="w-full py-3 mt-2 text-sm font-medium"
        style={{ color: "var(--text-secondary)" }}
      >
        Resend code
      </button>

      <button
        onClick={onEdit}
        className="w-full py-2 text-sm font-medium"
        style={{ color: "var(--text-tertiary)" }}
      >
        Use a different email
      </button>
    </div>
  );
}


// ---------- Slide 4: Location ----------
function SlideLocation({ locating, locationLabel, error, onRequest, onSkip }) {
  const done = !!locationLabel;
  return (
    <>
      <Eyebrow>03 · Location</Eyebrow>
      <Headline>
        {done ? `You're in ${locationLabel}` : "Find friends nearby"}
      </Headline>
      <Body>
        {done
          ? "Great — we'll show you people close to you first."
          : "Turn on location to discover people around you. We never share your exact location — only your city."}
      </Body>

      {error && (
        <p className="text-[13px] mb-4 -mt-3" style={{ color: "var(--danger)" }}>
          {error}
        </p>
      )}

      <PrimaryButton
        onClick={onRequest}
        disabled={locating || done}
        loading={locating}
      >
        {done ? "Location saved" : locating ? "Locating..." : "Enable location"}
      </PrimaryButton>

      {!done && (
        <button
          onClick={onSkip}
          className="w-full py-3 mt-2 text-sm font-medium"
          style={{ color: "var(--text-secondary)" }}
        >
          Maybe later
        </button>
      )}
    </>
  );
}

// ---------- Slide 5: Username ----------
function SlideUsername({ name, setName, error, onContinue }) {
  return (
    <>
      <Eyebrow>04 · Username</Eyebrow>
      <Headline>Choose a username</Headline>
      <Body>
        This is how friends will find you. Lowercase letters, numbers, and
        underscores only.
      </Body>

      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value.toLowerCase())}
        placeholder="yourname"
        maxLength={20}
        autoComplete="username"
        autoFocus
        className="w-full px-5 py-3.5 rounded-2xl text-[15px] font-medium outline-none mb-4 text-center transition-colors"
        style={{
          background: "var(--bg-soft)",
          color: "var(--text-primary)",
          border: "1px solid var(--border)",
        }}
        onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
        onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
        onKeyDown={(e) => e.key === "Enter" && onContinue()}
      />

      {error && (
        <p className="text-[13px] mb-3 text-center" style={{ color: "var(--danger)" }}>
          {error}
        </p>
      )}

      <PrimaryButton onClick={onContinue} disabled={!name.trim()}>
        Continue
      </PrimaryButton>
    </>
  );
}

// ---------- Slide 6: Avatar ----------
function SlideAvatar({ avatarUrl, uploading, error, onPickAvatar, onContinue }) {
  return (
    <>
      <Eyebrow>05 · Photo</Eyebrow>
      <Headline>Add a profile photo</Headline>
      <Body>
        A photo helps friends recognize you. You can always change it later.
      </Body>

      <div className="flex justify-center mb-6">
        <button
          onClick={onPickAvatar}
          disabled={uploading}
          className="relative w-28 h-28 rounded-full flex items-center justify-center disabled:opacity-60"
          style={{
            background: avatarUrl
              ? `url(${avatarUrl}) center/cover`
              : "var(--bg-soft)",
            border: "1px solid var(--border)",
          }}
        >
          {!avatarUrl && !uploading && (
            <UserIcon className="w-10 h-10" style={{ color: "var(--text-tertiary)" }} />
          )}
          {uploading && (
            <Loader2 className="w-7 h-7 animate-spin" style={{ color: "var(--accent)" }} />
          )}
          <div
            className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full flex items-center justify-center"
            style={{
              background: "var(--accent)",
              border: "3px solid var(--bg)",
            }}
          >
            <Camera className="w-4 h-4 text-white" strokeWidth={2.2} />
          </div>
        </button>
      </div>

      {error && (
        <p className="text-[13px] mb-3 text-center" style={{ color: "var(--danger)" }}>
          {error}
        </p>
      )}

      <PrimaryButton onClick={onContinue} disabled={uploading}>
        {avatarUrl ? "Continue" : "Skip for now"}
      </PrimaryButton>
    </>
  );
}

// ---------- Slide 7: Ready ----------
function SlideReady({ name, locationLabel, onFinish }) {
  const display = name?.trim().replace(/_/g, " ").split(" ")[0];
  return (
    <div className="text-center">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        className="inline-flex items-center justify-center w-20 h-20 rounded-full mx-auto mb-6"
        style={{
          background: "var(--accent)",
          boxShadow: "0 16px 48px rgba(59, 123, 255, 0.35)",
        }}
      >
        <Check className="w-10 h-10 text-white" strokeWidth={3} />
      </motion.div>

      <Eyebrow>06 · Ready</Eyebrow>
      <Headline>You're in{display ? `, ${display}` : ""}</Headline>
      <Body>
        {locationLabel
          ? `We'll show you people near ${locationLabel} first. Start chatting whenever you're ready.`
          : "You're all set. Start chatting whenever you're ready."}
      </Body>

      <PrimaryButton onClick={onFinish}>Enter Rodeo</PrimaryButton>
    </div>
  );
}
