import Navigation from "./Navigation.jsx";

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="md:ml-64 pb-24 md:pb-0 min-h-screen">
        {children}
      </main>
    </div>
  );
}
