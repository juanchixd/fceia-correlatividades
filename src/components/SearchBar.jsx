import React from "react";

export default function SearchBar({ nodes, onSelect }) {
  const handleChange = (e) => {
    const value = e.target.value;
    const foundNode = nodes.find((n) => n.data.label === value);
    if (foundNode) {
      onSelect(foundNode.id);
      e.target.value = "";
    }
  };

  return (
    <div
      className="card-style"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        height: "44px",
        padding: "0 12px",
        width: "100%",
        position: "relative",
      }}
    >
      <span style={{ fontSize: "16px", color: "var(--text-secondary)" }}>
        🔍
      </span>
      <input
        list="materias-list"
        placeholder="Buscar materia..."
        onChange={handleChange}
        style={{
          border: "none",
          outline: "none",
          fontSize: "14px",
          width: "100%",
          background: "transparent",
          color: "var(--text-primary)",
          padding: 0,
          margin: 0,
          height: "100%",
          boxShadow: "none",
          borderRadius: 0,
        }}
      />
      <datalist id="materias-list">
        {nodes.map((node) => (
          <option key={node.id} value={node.data.label} />
        ))}
      </datalist>
    </div>
  );
}
