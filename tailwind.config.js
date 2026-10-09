/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // --- Surfaces (via CSS vars) ---
        bg: {
          DEFAULT: "var(--bg)",
          soft: "var(--bg-soft)",
          card: "var(--bg-card)",
          "card-strong": "var(--bg-card-strong)",
          input: "var(--bg-input)",
          hover: "var(--bg-hover)",
          elevated: "var(--bg-elevated)",
        },
        // --- Text ---
        text: {
          DEFAULT: "var(--text-primary)",
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          tertiary: "var(--text-tertiary)",
        },
        // Legacy "warm" text (keep for existing components)
        warm: "var(--text-primary)",
        "warm-mute": "var(--text-secondary)",
        "warm-dim": "var(--text-tertiary)",

        // --- Borders ---
        border: {
          DEFAULT: "var(--border)",
          strong: "var(--border-strong)",
        },

        // --- Accents (semantic) ---
        accent: {
          DEFAULT: "var(--accent)",
          strong: "var(--accent-strong)",
          soft: "var(--accent-soft)",
          fg: "var(--accent-fg)",
        },
        brand: {
          DEFAULT: "var(--brand)",
          strong: "var(--brand-strong)",
          soft: "var(--brand-soft)",
          fg: "var(--brand-fg)",
        },
        success: "var(--success)",
        danger: "var(--danger)",
        warning: "var(--warning)",
        violet: "var(--violet)",

        // --- Legacy "iri" palette (keep for compatibility) ---
        iri: {
          pink: "var(--brand)",
          purple: "var(--violet)",
          blue: "var(--accent)",
          cyan: "#22D3EE",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      animation: {
        "gradient-shift": "gradient-shift 12s ease infinite",
        "float-slow": "float 9s ease-in-out infinite",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
      },
      keyframes: {
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-16px)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 30px rgba(99, 102, 241, 0.35)" },
          "50%": { boxShadow: "0 0 60px rgba(99, 102, 241, 0.60)" },
        },
      },
    },
  },
  plugins: [],
};
