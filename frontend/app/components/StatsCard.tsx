import React from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
  subtitle?: string;
}

export default function StatsCard({ title, value, icon, color = "var(--accent)", subtitle }: StatsCardProps) {
  return (
    <div className="card" style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
      <div style={{
        width: "48px", height: "48px",
        borderRadius: "12px",
        background: `${color}18`,
        border: `1px solid ${color}33`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "1.4rem",
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: "500", marginBottom: "0.25rem" }}>
          {title}
        </p>
        <p style={{ fontSize: "1.75rem", fontWeight: "800", color: "var(--text-primary)", lineHeight: 1 }}>
          {value}
        </p>
        {subtitle && (
          <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
