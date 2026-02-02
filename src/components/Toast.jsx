import React, { useEffect } from "react";

export default function ToastContainer({ notifications, removeNotification }) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      {notifications.map((n) => (
        <Toast key={n.id} {...n} onClose={() => removeNotification(n.id)} />
      ))}
    </div>
  );
}

function Toast({ type, message, onClose }) {
  // Auto-cerrar después de 3 segundos
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bg =
    type === "error" ? "#fee2e2" : type === "success" ? "#dcfce7" : "#fff";
  const color =
    type === "error" ? "#991b1b" : type === "success" ? "#166534" : "#333";
  const icon = type === "error" ? "⛔" : type === "success" ? "✅" : "ℹ️";

  return (
    <div
      className="toast-notification"
      style={{
        background: bg,
        color: color,
        padding: "12px 20px",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        minWidth: "250px",
        fontSize: "14px",
        fontWeight: "500",
        border: `1px solid ${type === "error" ? "#fecaca" : "#bbf7d0"}`,
        cursor: "pointer",
      }}
      onClick={onClose}
    >
      <span style={{ fontSize: "18px" }}>{icon}</span>
      <span>{message}</span>
    </div>
  );
}
