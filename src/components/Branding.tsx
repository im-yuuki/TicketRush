export function Logo({ className = "", accentColor = true }: { className?: string; accentColor?: boolean } = {}) {
  return (
    <div className={`flex items-center gap-0 select-none ${className}`}>
      <div
        className="flex items-center leading-none font-black"
        style={{
          fontFamily: "Nunito, sans-serif",
        }}
      >
        <span className="text-foreground">ticket</span>
        <span className={accentColor ? "text-accent" : "text-foreground"}>rush</span>
      </div>
      <svg
        className={`select-none ${accentColor ? "fill-accent" : "fill-foreground"}`}
        style={{
          height: "1.25em",
          width: "auto",
        }}
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M5.055 7.06C3.805 6.347 2.25 7.25 2.25 8.69v8.122c0 1.44 1.555 2.343 2.805 1.628L12 14.471v2.34c0 1.44 1.555 2.343 2.805 1.628l7.108-4.061c1.26-.72 1.26-2.536 0-3.256l-7.108-4.061C13.555 6.346 12 7.249 12 8.689v2.34L5.055 7.061Z" />
      </svg>
    </div>
  );
}
