import Navigation from "./Navigation.jsx";

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <Navigation />
      <main className="pl-[72px] w-full min-h-screen">
        {children}
      </main>
    </div>
  );
}
