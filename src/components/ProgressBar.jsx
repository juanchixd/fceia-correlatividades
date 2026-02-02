import React from "react";

export default function ProgressBar({ total, approved, average }) {
  const percentage = Math.round((approved / total) * 100) || 0;
  const avgDisplay = average && !isNaN(average) ? average.toFixed(2) : "-";

  return (
    <div
      className="card-style"
      style={{
        padding: "12px 20px",
        display: "flex",
        alignItems: "center",
        gap: "20px",
        minWidth: "300px",
      }}
    >
      {/* Sección Barra */}
      <div style={{ flex: 1 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "6px",
            fontSize: "11px",
            color: "var(--text-secondary)",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          <span>Tu Progreso</span>
          <span>
            {approved} / {total}
          </span>
        </div>

        {/* Track de la barra */}
        <div
          style={{
            width: "100%",
            height: "8px",
            background: "var(--bg-app)",
            borderRadius: "4px",
            overflow: "hidden",
            border: "1px solid var(--border-color)",
          }}
        >
          <div
            style={{
              width: `${percentage}%`,
              height: "100%",
              background: "linear-gradient(90deg, #2563eb 0%, #3b82f6 100%)", // Azul profesional
              transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          />
        </div>
      </div>

      {/* Sección Promedio */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          borderLeft: "1px solid var(--border-color)",
          paddingLeft: "20px",
        }}
      >
        <span
          style={{
            fontSize: "10px",
            color: "var(--text-secondary)",
            textTransform: "uppercase",
            fontWeight: "700",
          }}
        >
          Promedio
        </span>
        <span
          style={{
            fontWeight: "800",
            fontSize: "16px",
            color: "var(--text-primary)",
          }}
        >
          {avgDisplay}
        </span>
      </div>

      {/* Sección Porcentaje */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontSize: "10px",
            color: "var(--text-secondary)",
            textTransform: "uppercase",
            fontWeight: "700",
          }}
        >
          Avance
        </span>
        <span style={{ fontWeight: "800", fontSize: "16px", color: "#2563eb" }}>
          {percentage}%
        </span>
      </div>
    </div>
  );
}
