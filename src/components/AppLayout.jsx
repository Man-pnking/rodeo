import Navigation from "./Navigation.jsx";

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <Navigation />
      <main className="md:ml-64 pb-24 md:pb-0 min-h-screen w-full overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
