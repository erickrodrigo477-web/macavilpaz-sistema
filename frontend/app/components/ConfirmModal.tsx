"use client";

import React from "react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  confirmColor?: string;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText,
  confirmColor,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
      onClick={onCancel}
    >
      <div
        className="card"
        style={{
          width: "100%",
          maxWidth: "400px",
          padding: "2rem",
          boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ textAlign: "center" }}>
          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: "800",
              color: "var(--text-primary)",
              marginBottom: "0.5rem",
            }}
          >
            {title}
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            {message}
          </p>
        </div>

        <div style={{ display: "flex", gap: "1rem" }}>
          <button
            className="btn-secondary"
            style={{ flex: 1, padding: "0.85rem" }}
            onClick={onCancel}
          >
            Cancelar
          </button>
          <button
            className="btn-primary"
            style={{
              flex: 1,
              padding: "0.85rem",
              background: confirmColor || "#ef4444",
              borderColor: confirmColor || "#ef4444",
            }}
            onClick={onConfirm}
          >
            {confirmText || "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}
