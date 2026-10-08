import { Waves } from "@indhu_hehhehe/wave-background";

export default function AnimatedBackground() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    >
      <Waves
        backgroundColor="#050510"
        palette={[
          [255, 110, 199],
          [168, 85, 247],
          [59, 130, 246],
          [34, 211, 238],
        ]}
        waveX={30}
        waveY={15}
        frameInterval={42}
        colorCycle={6000}
      />
    </div>
  );
}
