"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // Evitar error de hidratación en SSR
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div style={{ width: "32px", height: "32px" }} />;
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      style={{
        width: "36px",
        height: "36px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "50%",
        background: "transparent",
        border: "1px solid var(--border)",
        color: "var(--text-secondary)",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        transition: "all 0.3s ease",
      }}
      title={`Cambiar a modo ${isDark ? "claro" : "oscuro"}`}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = "var(--text-primary)";
        e.currentTarget.style.background = "var(--bg-card)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = "var(--text-secondary)";
        e.currentTarget.style.background = "transparent";
      }}
    >
      <div style={{
        position: "relative",
        width: "18px",
        height: "18px",
      }}>
        {/* Sol */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            position: "absolute",
            inset: 0,
            transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
            transform: isDark ? "rotate(-90deg) scale(0)" : "rotate(0) scale(1)",
            opacity: isDark ? 0 : 1,
          }}
        >
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>

        {/* Luna */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            position: "absolute",
            inset: 0,
            transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
            transform: isDark ? "rotate(0) scale(1)" : "rotate(90deg) scale(0)",
            opacity: isDark ? 1 : 0,
          }}
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      </div>
    </button>
  );
}
