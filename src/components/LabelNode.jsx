import React from "react";

export default function LabelNode({ data }) {
  return (
    <div
      style={{
        fontSize: "16px",
        fontWeight: "800",
        color: "var(--text-muted)",
        textTransform: "uppercase",
        letterSpacing: "1px",
        borderBottom: "2px dashed var(--border-dashed)",
        paddingBottom: "10px",
        marginBottom: "10px",
        width: "250px",
        textAlign: "center",
        fontFamily: "var(--font-sans)",
      }}
    >
      {data.label}
    </div>
  );
}
