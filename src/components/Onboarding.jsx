import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  MapPin,
  User as UserIcon,
  Check,
  Camera,
  Loader2,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useProfile } from "../hooks/useProfile";
import { useMedia } from "../hooks/useMedia";
import WorldMap from "./WorldMap.jsx";

const TOTAL_STEPS = 4;

const STEPS = [
  { id: "welcome", label: "Welcome" },
  { id: "location", label: "Location" },
  { id: "profile", label: "Profile" },
  { id: "ready", label: "Ready" },
];

export default function Onboarding({ onComplete }) {
  const { user } = useAuth();
  const { profile, update, refetch } = useProfile(user?.id);
  const { uploadMedia } = useMedia(user?.id);

  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationLabel, setLocationLabel] = useState("");
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  useEffect(() => {
    if (profile?.display_name && !name) setName(profile.display_name);
    if (profile?.avatar_url && !avatarUrl) setAvatarUrl(profile.avatar_url);
    if (profile?.location_label && !locationLabel) setLocationLabel(profile.location_label);
  }, [profile]);

  const next = () => {
    setError("");
    if (step < TOTAL_STEPS - 1) setStep((s) => s + 1);
    else onComplete?.();
  };

  const back = () => {
    setError("");
    if (step > 0) setStep((s) => s - 1);
  };

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
        await update({
          latitude,
          longitude,
          location_label: label,
          location_updated_at: new Date().toISOString(),
        });
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
    await update({ avatar_url: data.url });
  };

  const saveName = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Please enter a name");
      return;
    }
    await update({ display_name: trimmed });
    await refetch();
    next();
  };

  const skipToFinish = () => setStep(TOTAL_STEPS - 1);

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden flex flex-col"
      style={{ background: "var(--bg)" }}
    >
      {/* ===== Map — full bleed ===== */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.9 }}
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

      {/* ===== Top bar — Back + Skip ===== */}
      <div
        className="relative z-20 flex items-center justify-between px-6"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0) + 20px)" }}
      >
        {step > 0 ? (
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
        <button
          onClick={skipToFinish}
          className="text-sm font-medium"
          style={{ color: "var(--text-tertiary)" }}
        >
          Skip
        </button>
      </div>

      {/* ===== Spacer so map shows ===== */}
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
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            >
              {step === 0 && <SlideWelcome onContinue={next} />}
              {step === 1 && (
                <SlideLocation
                  locating={locating}
                  locationLabel={locationLabel}
                  error={error}
                  onRequest={requestLocation}
                  onSkip={next}
                />
              )}
              {step === 2 && (
                <SlideProfile
                  name={name}
                  setName={setName}
                  avatarUrl={avatarUrl}
                  uploading={uploading}
                  error={error}
                  onPickAvatar={() => fileRef.current?.click()}
                  onContinue={saveName}
                />
              )}
              {step === 3 && (
                <SlideReady
                  name={name}
                  locationLabel={locationLabel}
                  onFinish={onComplete}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {STEPS.map((_, i) => (
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
      <Eyebrow>01 · Welcome</Eyebrow>
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

// ---------- Slide 2: Location ----------
function SlideLocation({ locating, locationLabel, error, onRequest, onSkip }) {
  const done = !!locationLabel;
  return (
    <>
      <Eyebrow>02 · Location</Eyebrow>
      <Headline>
        {done ? `You're in ${locationLabel}` : "Find friends nearby"}
      </Headline>
      <Body>
        {done
          ? "Great — we'll show you people close to you first."
          : "Turn on location to discover people around you. We never share your exact location — only your city."}
      </Body>

      {error && (
        <p
          className="text-[13px] mb-4 -mt-3"
          style={{ color: "var(--danger)" }}
        >
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

// ---------- Slide 3: Profile ----------
function SlideProfile({
  name,
  setName,
  avatarUrl,
  uploading,
  error,
  onPickAvatar,
  onContinue,
}) {
  return (
    <>
      <Eyebrow>03 · Profile</Eyebrow>
      <Headline>Who are you?</Headline>
      <Body>
        Choose a name and photo — this is how people will find you.
      </Body>

      {/* Avatar */}
      <div className="flex justify-center mb-6 -mt-1">
        <button
          onClick={onPickAvatar}
          disabled={uploading}
          className="relative w-24 h-24 rounded-full flex items-center justify-center disabled:opacity-60"
          style={{
            background: avatarUrl
              ? `url(${avatarUrl}) center/cover`
              : "var(--bg-soft)",
            border: "1px solid var(--border)",
          }}
        >
          {!avatarUrl && !uploading && (
            <UserIcon className="w-8 h-8" style={{ color: "var(--text-tertiary)" }} />
          )}
          {uploading && (
            <Loader2
              className="w-6 h-6 animate-spin"
              style={{ color: "var(--accent)" }}
            />
          )}
          <div
            className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center"
            style={{
              background: "var(--accent)",
              border: "3px solid var(--bg)",
            }}
          >
            <Camera className="w-3.5 h-3.5 text-white" strokeWidth={2.2} />
          </div>
        </button>
      </div>

      {/* Name input */}
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name"
        maxLength={30}
        className="w-full px-5 py-3.5 rounded-2xl text-[15px] font-medium outline-none mb-4 text-center transition-colors"
        style={{
          background: "var(--bg-soft)",
          color: "var(--text-primary)",
          border: "1px solid var(--border)",
        }}
        onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
        onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
      />

      {error && (
        <p className="text-[13px] mb-3 text-center" style={{ color: "var(--danger)" }}>
          {error}
        </p>
      )}

      <PrimaryButton
        onClick={onContinue}
        disabled={!name.trim() || uploading}
      >
        Continue
      </PrimaryButton>
    </>
  );
}

// ---------- Slide 4: Ready ----------
function SlideReady({ name, locationLabel, onFinish }) {
  const firstName = name?.trim().split(" ")[0];
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

      <Eyebrow>04 · Ready</Eyebrow>
      <Headline>
        You're in{firstName ? `, ${firstName}` : ""}
      </Headline>
      <Body>
        {locationLabel
          ? `We'll show you people near ${locationLabel} first. Start chatting whenever you're ready.`
          : "You're all set. Start chatting whenever you're ready."}
      </Body>

      <PrimaryButton onClick={onFinish}>Enter Rodeo</PrimaryButton>
    </div>
  );
}
