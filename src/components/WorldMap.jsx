// Dotted world map generator — reproduces the classic "dot matrix" world map look.
// Uses a set of rectangular/elliptical regions per continent to decide which grid
// cells should contain a dot. Result: ~1000-1500 tiny dots forming continents.

const VIEW_W = 200;
const VIEW_H = 100;
const DOT_STEP = 1.6;
const DOT_RADIUS = 0.32;

// Each region is { x, y, w, h, shape } — shape: "rect" | "ellipse"
// Coordinates are in the 200x100 viewBox space.
const CONTINENT_REGIONS = [
  // ===== North America =====
  { shape: "rect", x: 22, y: 15, w: 34, h: 12 },   // Canada / US
  { shape: "rect", x: 24, y: 27, w: 22, h: 10 },   // US / Mexico
  { shape: "rect", x: 28, y: 37, w: 10, h: 8 },    // Central America
  { shape: "ellipse", x: 48, y: 12, r: 9, ry: 6 }, // Alaska / NW
  { shape: "ellipse", x: 52, y: 14, r: 6, ry: 5 }, // Hudson
  { shape: "rect", x: 52, y: 20, w: 8, h: 6 },     // Greenland area
  { shape: "rect", x: 60, y: 22, w: 4, h: 4 },     // Greenland east

  // ===== South America =====
  { shape: "ellipse", x: 56, y: 55, r: 6, ry: 8 },  // North SA
  { shape: "ellipse", x: 55, y: 66, r: 5, ry: 8 },  // Middle SA
  { shape: "ellipse", x: 57, y: 76, r: 3.5, ry: 6 },// South SA
  { shape: "ellipse", x: 58, y: 82, r: 2, ry: 3 },  // Tip

  // ===== Europe =====
  { shape: "rect", x: 92, y: 24, w: 18, h: 10 },   // Western Europe
  { shape: "rect", x: 94, y: 34, w: 14, h: 4 },    // Mediterranean

  // ===== Africa =====
  { shape: "rect", x: 92, y: 42, w: 22, h: 12 },   // North Africa
  { shape: "rect", x: 94, y: 54, w: 18, h: 14 },   // Central Africa
  { shape: "ellipse", x: 102, y: 70, r: 6, ry: 5 },// Southern Africa
  { shape: "rect", x: 106, y: 76, w: 6, h: 4 },    // South Africa tip

  // ===== Asia =====
  { shape: "rect", x: 112, y: 20, w: 30, h: 10 },  // Russia west
  { shape: "rect", x: 142, y: 18, w: 26, h: 14 },  // Siberia
  { shape: "rect", x: 116, y: 30, w: 24, h: 8 },   // Central Asia
  { shape: "rect", x: 118, y: 38, w: 20, h: 8 },   // India / Middle East
  { shape: "rect", x: 140, y: 32, w: 24, h: 10 },  // China
  { shape: "rect", x: 148, y: 42, w: 14, h: 8 },   // SE Asia
  { shape: "ellipse", x: 162, y: 50, r: 4, ry: 3 },// Indonesia west
  { shape: "ellipse", x: 170, y: 52, r: 3, ry: 2 },// Indonesia east
  { shape: "ellipse", x: 176, y: 54, r: 2, ry: 2 },// Papua

  // ===== Australia =====
  { shape: "ellipse", x: 172, y: 68, r: 9, ry: 5 },// Australia
  { shape: "ellipse", x: 182, y: 74, r: 3, ry: 2 },// Tasmania / NZ

  // ===== Extra small islands =====
  { shape: "ellipse", x: 90, y: 8, r: 4, ry: 3 },  // Iceland
  { shape: "ellipse", x: 74, y: 40, r: 2, ry: 2 }, // Caribbean
  { shape: "ellipse", x: 176, y: 60, r: 2, ry: 2 },// NZ north
];

// Returns true if a point (px, py) is inside any continent region
function isLand(px, py) {
  for (const r of CONTINENT_REGIONS) {
    if (r.shape === "rect") {
      if (px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h) return true;
    } else {
      const dx = (px - r.x) / r.r;
      const dy = (py - r.y) / r.ry;
      if (dx * dx + dy * dy <= 1) return true;
    }
  }
  return false;
}

// Generate the dots
function generateDots() {
  const dots = [];
  for (let y = 0; y <= VIEW_H; y += DOT_STEP) {
    for (let x = 0; x <= VIEW_W; x += DOT_STEP) {
      if (isLand(x, y)) dots.push({ x, y });
    }
  }
  return dots;
}

const DOTS = generateDots();

// Hot spots — pulsing accents
const HOT_SPOTS = [
  { x: 44, y: 24 },  // New York
  { x: 100, y: 28 }, // London
  { x: 158, y: 36 }, // Tokyo
  { x: 58, y: 68 },  // São Paulo
  { x: 106, y: 66 }, // Johannesburg
  { x: 172, y: 68 }, // Sydney
  { x: 100, y: 48 }, // Cairo
  { x: 138, y: 44 }, // Mumbai
  { x: 168, y: 26 }, // Moscow
];

import { motion } from "framer-motion";

export default function WorldMap({
  className = "",
  dotColor = "#2AA5B0",
  activeColor = "#3B7BFF",
  animateHotSpots = true,
  opacity = 1,
}) {
  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      preserveAspectRatio="xMidYMid meet"
      className={className}
      style={{ opacity, width: "100%", height: "100%", display: "block" }}
      aria-hidden
    >
      {/* Base dots — continents */}
      {DOTS.map((dot, i) => (
        <circle
          key={`d-${i}`}
          cx={dot.x}
          cy={dot.y}
          r={DOT_RADIUS}
          fill={dotColor}
        />
      ))}

      {/* Hot spots — pulsing accent dots */}
      {HOT_SPOTS.map((spot, i) => {
        const delay = i * 0.35;
        return (
          <g key={`h-${i}`}>
            {animateHotSpots && (
              <motion.circle
                cx={spot.x}
                cy={spot.y}
                r={DOT_RADIUS}
                fill="none"
                stroke={activeColor}
                strokeWidth={0.15}
                initial={{ r: DOT_RADIUS, opacity: 0.8 }}
                animate={{ r: [DOT_RADIUS, 1.8, DOT_RADIUS], opacity: [0.8, 0, 0.8] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay,
                  ease: "easeOut",
                }}
              />
            )}
            <circle cx={spot.x} cy={spot.y} r={DOT_RADIUS * 1.6} fill={activeColor} />
          </g>
        );
      })}
    </svg>
  );
}
