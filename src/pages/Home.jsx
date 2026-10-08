export default function Home() {
  return (
    <div className="relative min-h-screen flex items-center justify-center px-6">
      <div
        className="absolute rounded-full pointer-events-none animate-float-slow"
        style={{
          width: "min(70vw, 600px)",
          height: "min(70vw, 600px)",
          background: "radial-gradient(circle, rgba(168,85,247,0.25) 0%, rgba(59,130,246,0.08) 45%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />
      <div className="relative z-10 text-center max-w-2xl">
        <div className="text-label mb-6">Rodeo</div>
        <h1 className="display-xl mb-6">
          Meet. Ride. <span className="gradient-text">Together.</span>
        </h1>
        <p className="text-body mb-10">
          A social layer and ride marketplace in one place.
        </p>
        <button className="btn-primary">Get started</button>
      </div>
    </div>
  );
}
