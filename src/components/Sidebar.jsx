import React, { useState, useEffect } from "react";

export default function Sidebar({
  node,
  status,
  grade,
  onUpdateStatus,
  onUpdateGrade,
  onClose,
  error,
  // Props para selectores de optativas
  onSelectMateria,
  onUnselectMateria,
  currentSelection,
  availableOptions,
}) {
  if (!node) return null;

  // Estado derivado
  const isCI = status === "CI" || status === "approved";
  const isApproved = status === "approved";
  const [localGrade, setLocalGrade] = useState(grade || "");
  const isMobile = window.innerWidth < 768;

  useEffect(() => {
    setLocalGrade(grade || "");
  }, [grade, node]);

  const handleGradeChange = (e) => {
    const val = e.target.value;
    setLocalGrade(val);
    // Convertir a número o null si está vacío
    if (val && !isNaN(val)) onUpdateGrade(node.id, parseInt(val));
    else onUpdateGrade(node.id, null);
  };

  const requiredCount = node.data.requeridas || 0;
  const isSlot = node.data.esSlot;

  return (
    <div
      className="sidebar-panel card-style"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Handle para móvil */}
      {isMobile && <div className="mobile-handle" />}

      {/* HEADER */}
      <div className="sidebar-header">
        <div style={{ flex: 1, paddingRight: "10px" }}>
          <span className="sidebar-subtitle">
            {node.data.cuatrimestre
              ? `${node.data.cuatrimestre}° CUATRIMESTRE`
              : "EXTRA"}
          </span>

          {/* Título de la materia */}
          <h2 className="sidebar-title">{node.data.label}</h2>

          {/* Badge de Requisitos de Cantidad */}
          {requiredCount > 0 && (
            <div className="sidebar-badge-warning">
              <span>🔒</span>
              <span>Requiere {requiredCount} finales</span>
            </div>
          )}

          {/* Descripción y Link (Si existen en el JSON) */}
          {(node.data.descripcion || node.data.link) && (
            <div
              style={{
                marginTop: "12px",
                fontSize: "13px",
                color: "var(--text-secondary)",
                background: "var(--bg-app)",
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid var(--border-color)",
              }}
            >
              {node.data.descripcion && (
                <p style={{ margin: "0 0 8px 0", lineHeight: "1.4" }}>
                  {node.data.descripcion}
                </p>
              )}
              {node.data.link && (
                <a
                  href={node.data.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "var(--primary)",
                    fontWeight: "600",
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  📄 Ver Plan / Programa
                </a>
              )}
            </div>
          )}
        </div>
        <button onClick={onClose} className="sidebar-close-btn">
          ✕
        </button>
      </div>

      {/* MENSAJES DE ERROR */}
      {error && <div className="sidebar-error">⚠️ {error}</div>}

      {/* SECCIÓN: SELECCIÓN DE OPTATIVA */}
      {isSlot && (
        <div
          style={{
            marginTop: "15px",
            padding: "15px",
            background: "var(--bg-app)",
            borderRadius: "10px",
            border: "1px solid var(--border-color)",
          }}
        >
          {!currentSelection ? (
            <>
              <label
                style={{
                  display: "block",
                  fontSize: "11px",
                  fontWeight: "700",
                  color: "var(--text-secondary)",
                  marginBottom: "8px",
                  textTransform: "uppercase",
                }}
              >
                Selecciona la materia real:
              </label>
              <select
                className="card-style"
                style={{ width: "100%", height: "40px" }}
                onChange={(e) => onSelectMateria(node.id, e.target.value)}
                defaultValue=""
              >
                <option value="" disabled>
                  -- Elige una opción --
                </option>
                {availableOptions &&
                  availableOptions.map((opt) => (
                    <option key={opt.id} value={opt.label}>
                      {opt.label}
                    </option>
                  ))}
              </select>
            </>
          ) : (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontWeight: "600", fontSize: "14px" }}>
                {currentSelection}
              </span>
              <button
                onClick={() => onUnselectMateria(node.id)}
                style={{
                  fontSize: "11px",
                  color: "var(--primary)",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                Cambiar
              </button>
            </div>
          )}
        </div>
      )}

      {/* BOTONES DE ACCIÓN */}
      <div
        className="sidebar-actions"
        style={{
          marginTop: "20px",
          opacity: isSlot && !currentSelection ? 0.5 : 1,
          pointerEvents: isSlot && !currentSelection ? "none" : "auto",
        }}
      >
        {/* BOTÓN 1: CONDICIÓN INTERMEDIA (CI) */}
        <button
          onClick={() => onUpdateStatus(node, isCI ? "pending" : "CI")}
          className={`sidebar-btn ${isCI ? "btn-active-yellow" : "btn-outline"}`}
        >
          {isCI
            ? "✓ Condición intermedia (CI)"
            : "Marcar condición intermedia (CI)"}
        </button>

        {/* BOTÓN 2: FINAL */}
        <div className="sidebar-row-final">
          <button
            onClick={() => onUpdateStatus(node, isApproved ? "CI" : "approved")}
            className={`sidebar-btn ${isApproved ? "btn-active-green" : "btn-filled"}`}
            style={{ flex: 1 }}
          >
            {isApproved ? "🏆 Materia Aprobada" : "Marcar aprobada"}
          </button>

          {/* Input de Nota (Solo aparece si aprobaste el final) */}
          {isApproved && (
            <input
              type="number"
              min="1"
              max="10"
              placeholder="Nota"
              value={localGrade}
              onChange={handleGradeChange}
              className="grade-input"
            />
          )}
        </div>
      </div>
    </div>
  );
}
