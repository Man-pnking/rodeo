let ctx = null;

function getCtx() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

function beep({ freq = 880, duration = 0.08, type = "sine", gain = 0.06, sweep = null }) {
  const c = getCtx();
  if (!c) return;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, c.currentTime);
  if (sweep) {
    osc.frequency.exponentialRampToValueAtTime(sweep, c.currentTime + duration);
  }
  g.gain.setValueAtTime(0, c.currentTime);
  g.gain.linearRampToValueAtTime(gain, c.currentTime + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + duration);
  osc.connect(g).connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + duration);
}

export const sounds = {
  send: () => beep({ freq: 1200, sweep: 1600, duration: 0.09, gain: 0.05 }),
  receive: () => {
    beep({ freq: 800, sweep: 1000, duration: 0.1, gain: 0.06 });
    setTimeout(() => beep({ freq: 1200, duration: 0.08, gain: 0.05 }), 90);
  },
  notification: () => {
    beep({ freq: 700, sweep: 900, duration: 0.12, gain: 0.07 });
  },
  success: () => {
    beep({ freq: 900, duration: 0.08, gain: 0.05 });
    setTimeout(() => beep({ freq: 1300, duration: 0.1, gain: 0.05 }), 70);
  },
  error: () => {
    beep({ freq: 300, sweep: 180, duration: 0.18, type: "triangle", gain: 0.08 });
  },
  tap: () => beep({ freq: 900, duration: 0.04, gain: 0.03 }),
};

export function unlockSounds() {
  getCtx();
}
