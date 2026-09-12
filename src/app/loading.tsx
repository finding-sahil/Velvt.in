export default function Loading() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      {/* Sleek, ambient top loading pulse line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-red to-transparent animate-pulse shadow-[0_0_12px_var(--red-glow)]" />
    </div>
  );
}
