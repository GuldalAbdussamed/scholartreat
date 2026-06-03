"use client";

import { useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { useThemeStore } from "@/lib/theme";

export function ThemeToggle() {
  const { theme, toggle } = useThemeStore();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-xs transition-all hover:scale-[1.02] cursor-pointer"
      style={{
        background: theme === "dark"
          ? "linear-gradient(135deg, oklch(0.2 0.04 280), oklch(0.18 0.03 60))"
          : "linear-gradient(135deg, oklch(0.95 0.02 60), oklch(0.92 0.02 280))",
        color: theme === "dark" ? "oklch(0.75 0.1 60)" : "oklch(0.3 0.08 280)",
        border: theme === "dark" ? "1px solid oklch(0.35 0.06 60 / 30%)" : "1px solid oklch(0.7 0.06 280 / 30%)",
      }}
    >
      {theme === "dark" ? (
        <>
          <Sun className="h-3.5 w-3.5" />
          <span>Light Mode</span>
        </>
      ) : (
        <>
          <Moon className="h-3.5 w-3.5" />
          <span>Dark Mode</span>
        </>
      )}
    </button>
  );
}
