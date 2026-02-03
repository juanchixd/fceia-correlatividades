import React, { memo } from "react";
import { Handle, Position } from "@xyflow/react";

const getStatusColor = (status) => {
  switch (status) {
    case "approved":
      return "var(--status-approved)";
    case "CI":
      return "#f59e0b";
    case "available":
      return "var(--status-available)";
    default:
      return "var(--border-color)";
  }
};

export default memo(({ data, isConnectable }) => {
  const color = getStatusColor(data.status);
  const isPending = !data.status || data.status === "pending";

  return (
    <div
      className="card-style"
      style={{
        padding: "10px 14px",
        width: 180,
        textAlign: "left",
        position: "relative",
        borderLeft: `4px solid ${color}`,
        opacity: isPending ? 0.8 : 1,
        transition: "transform 0.1s",
        boxShadow: data.anual
          ? "0 4px 12px rgba(139, 92, 246, 0.15)"
          : "var(--shadow-card)",
        border: data.anual
          ? "1px solid rgba(139, 92, 246, 0.3)"
          : "1px solid var(--border-color)",
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        style={{ opacity: 0 }}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: "10px",
              textTransform: "uppercase",
              color: "var(--text-secondary)",
              fontWeight: 600,
            }}
          >
            {data.cuatrimestre ? `${data.cuatrimestre}° CUATRI` : "EXTRA"}
          </span>

          {data.anual && (
            <span
              style={{
                fontSize: "9px",
                fontWeight: "800",
                background: "#8b5cf6",
                color: "white",
                padding: "2px 6px",
                borderRadius: "4px",
                letterSpacing: "0.5px",
              }}
            >
              ANUAL
            </span>
          )}
        </div>

        <span
          style={{
            fontSize: "13px",
            fontWeight: "600",
            lineHeight: 1.3,
            color: "var(--text-primary)",
          }}
        >
          {data.label}
        </span>
      </div>

      <div style={{ position: "absolute", top: 8, right: 8, fontSize: "10px" }}>
        {data.status === "approved" && "✅"}
        {data.status === "CI" && "⚠️"}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        style={{ opacity: 0 }}
      />
    </div>
  );
});
