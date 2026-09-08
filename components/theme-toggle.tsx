"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Переключить тему"
      className={cn(
        "relative h-[30px] w-[52px] shrink-0 rounded-full border border-input bg-muted transition-colors duration-300 cursor-pointer",
        className
      )}
    >
      <span
        className="absolute top-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-card text-primary shadow-soft transition-all duration-300 ease-soft"
        style={{ left: isDark ? "26px" : "2px" }}
      >
        {mounted && isDark ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
      </span>
    </button>
  );
}
