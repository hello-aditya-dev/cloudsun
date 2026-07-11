"use client";

export function Logo({ size = 28, className = "" }: { size?: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* sun arc above a cloud */}
        <circle cx="16" cy="11" r="5" fill="oklch(0.62 0.16 42)" />
        <path
          d="M4 22 C4 17, 8 15, 12 16 C13 12, 18 12, 20 16 C24 14, 28 17, 28 21 C28 24, 26 26, 23 26 L9 26 C6 26, 4 24, 4 22 Z"
          fill="oklch(0.24 0.012 50)"
        />
      </svg>
    </span>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-serif text-xl tracking-tight ${className}`}>
      <Logo size={22} />
      <span>
        Cloud<span className="text-[oklch(0.62_0.16_42)]">Sun</span>
      </span>
    </span>
  );
}
