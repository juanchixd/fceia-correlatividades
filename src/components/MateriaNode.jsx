import React, { memo } from "react";
import { Handle, Position } from "@xyflow/react";

const getStatusColor = (status) => {
  switch (status) {
    case "approved":
      return "var(--status-approved)";
    case "CI":
      return "var(--status-ci)";
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
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        style={{ opacity: 0 }}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        <span
          style={{
            fontSize: "10px",
            textTransform: "uppercase",
            color: "var(--text-secondary)",
            fontWeight: 600,
          }}
        >
          {data.cuatrimestre ? `${data.cuatrimestre}° Cuatri` : "Materia"}
        </span>
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
        {data.status === "available" && "🔹"}
        {isPending && "🔒"}
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
