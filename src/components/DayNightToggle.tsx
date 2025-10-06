import { useEffect, useMemo, useState } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

// Cycles: light -> dark -> system -> light
const THEMES = ['light', 'dark', 'system'] as const;

type ThemeMode = typeof THEMES[number];

function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;
  if (mode === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.toggle('dark', prefersDark);
    localStorage.setItem('theme', 'system');
  } else {
    root.classList.toggle('dark', mode === 'dark');
    localStorage.setItem('theme', mode);
  }
}

const DayNightToggle = () => {
  const [index, setIndex] = useState<number>(() => {
    const saved = localStorage.getItem('theme') as ThemeMode | null;
    return Math.max(0, THEMES.indexOf(saved ?? 'system'));
  });

  const mode: ThemeMode = THEMES[index] ?? 'system';
  const rotation = useMemo(() => index * 120, [index]);

  useEffect(() => {
    applyTheme(mode);
  }, [mode]);

  const handleClick = () => setIndex((prev) => (prev + 1) % 3);

  return (
    <div
      className="
        relative w-12 h-12
        rounded-full
        bg-card/60 border border-border/40 backdrop-blur-md
        shadow-elegant skeuomorphic-card
        flex items-center justify-center
      "
      aria-label={`Theme: ${mode}`}
      title={`Theme: ${mode}`}
    >
      {/* Attachment to navbar via visual stem */}
      <div className="absolute -top-4 h-4 w-[2px] bg-border/60" />

      {/* Rotating Cardboard Wheel */}
      <button
        type="button"
        onClick={handleClick}
        className="relative w-10 h-10 rounded-full bg-card/80 border border-border/50 shadow-inner focus:outline-none"
        style={{ transform: `rotate(${rotation}deg)`, transition: 'transform 500ms cubic-bezier(0.4,0,0.2,1)' }}
      >
        {/* Rivet in the middle */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-border/80 shadow" />
        </div>

        {/* Y-layout spokes with icons at 120° increments */}
        <div className="absolute inset-0">
          <div className="absolute left-1/2 top-[4%] -translate-x-1/2 text-foreground/90">
            <Sun className="w-4 h-4" />
          </div>
          <div className="absolute right-[6%] top-1/2 -translate-y-1/2 text-foreground/90">
            <Moon className="w-4 h-4" />
          </div>
          <div className="absolute left-[6%] top-1/2 -translate-y-1/2 text-foreground/90">
            <Monitor className="w-4 h-4" />
          </div>
        </div>
      </button>
    </div>
  );
};

export default DayNightToggle;