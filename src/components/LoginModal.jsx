import React, { useState } from "react";

export default function LoginModal({ isOpen, onClose, onLogin, currentData }) {
  const [view, setView] = useState("login");
  const [legajo, setLegajo] = useState("");
  const [password, setPassword] = useState("");
  const [question, setQuestion] = useState("Nombre de tu primera mascota");
  const [answer, setAnswer] = useState("");
  const [recoveredQuestion, setRecoveredQuestion] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isNewUserMode, setIsNewUserMode] = useState(false);

  if (!isOpen) return null;

  // --- HANDLERS ---

  const handleLoginOrRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "login",
          legajo,
          password,
          data: currentData,
          question: isNewUserMode ? question : undefined,
          answer: isNewUserMode ? answer : undefined,
        }),
      });
      const json = await res.json();

      // Si falla porque falta pregunta (es usuario nuevo intentando loguear sin datos extra)
      if (res.status === 400 && json.error.includes("Falta pregunta")) {
        setError("Usuario nuevo detectado. Por favor completa la seguridad.");
        setIsNewUserMode(true); // Desplegamos campos de seguridad
        setLoading(false);
        return;
      }

      if (!res.ok) throw new Error(json.error);
      onLogin(json.data, { legajo, password });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "get_question", legajo }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      setRecoveredQuestion(json.question);
      setView("forgot_answer");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reset_password",
          legajo,
          answer,
          newPassword,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      alert("¡Contraseña cambiada! Ahora inicia sesión.");
      setView("login");
      setPassword("");
      setIsNewUserMode(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER ---

  const btnPrimary = {
    background: "var(--primary)",
    color: "var(--primary-fg)",
    padding: "12px",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "14px",
    marginTop: "10px",
  };
  const linkStyle = {
    fontSize: "12px",
    cursor: "pointer",
    color: "var(--text-secondary)",
    textDecoration: "underline",
  };
  const inputStyle = {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      <div
        className="glass-panel"
        style={{
          padding: "30px",
          borderRadius: "24px",
          width: "360px",
          display: "flex",
          flexDirection: "column",
          gap: "15px",
        }}
      >
        {/* VISTA 1: LOGIN */}
        {view === "login" && (
          <form
            onSubmit={handleLoginOrRegister}
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            <div style={{ textAlign: "center", marginBottom: "10px" }}>
              <h2
                style={{
                  margin: 0,
                  fontSize: "24px",
                  color: "var(--text-primary)",
                }}
              >
                Bienvenido
              </h2>
              <p
                style={{
                  margin: "5px 0 0",
                  fontSize: "14px",
                  color: "var(--text-secondary)",
                }}
              >
                Guarda tu progreso en la nube
              </p>
            </div>

            <input
              placeholder="Legajo"
              value={legajo}
              onChange={(e) => setLegajo(e.target.value)}
              required
              style={inputStyle}
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={inputStyle}
            />

            {isNewUserMode && (
              <div
                style={{
                  background: "var(--bg-app)",
                  padding: "15px",
                  borderRadius: "12px",
                  border: "1px solid var(--border-color)",
                }}
              >
                <p
                  style={{
                    fontSize: "12px",
                    margin: "0 0 10px 0",
                    color: "var(--text-primary)",
                    fontWeight: "bold",
                  }}
                >
                  ✨ Configura tu recuperación:
                </p>
                <select
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  style={{ ...inputStyle, marginBottom: "8px" }}
                >
                  <option>Nombre de tu primera mascota</option>
                  <option>Nombre de tu escuela primaria</option>
                  <option>Ciudad donde naciste</option>
                </select>
                <input
                  placeholder="Respuesta secreta"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  required
                  style={inputStyle}
                />
              </div>
            )}

            {error && (
              <div
                style={{
                  color: "#ef4444",
                  fontSize: "13px",
                  background: "rgba(239,68,68,0.1)",
                  padding: "10px",
                  borderRadius: "8px",
                }}
              >
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={btnPrimary}>
              {loading
                ? "Cargando..."
                : isNewUserMode
                  ? "Crear Cuenta"
                  : "Iniciar Sesión"}
            </button>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "10px",
              }}
            >
              <span onClick={onClose} style={linkStyle}>
                Cancelar
              </span>
              <span
                onClick={() => {
                  setView("forgot_search");
                  setError(null);
                }}
                style={{ ...linkStyle, color: "var(--primary)" }}
              >
                ¿Olvidaste tu contraseña?
              </span>
            </div>
          </form>
        )}

        {/* VISTA 2: RECUPERAR (BUSCAR) */}
        {view === "forgot_search" && (
          <form
            onSubmit={handleSearchUser}
            style={{ display: "flex", flexDirection: "column", gap: "15px" }}
          >
            <h3 style={{ margin: 0, color: "var(--text-primary)" }}>
              Recuperar Cuenta
            </h3>
            <p
              style={{
                margin: 0,
                fontSize: "13px",
                color: "var(--text-secondary)",
              }}
            >
              Ingresa tu legajo para buscar tu pregunta de seguridad.
            </p>
            <input
              placeholder="Legajo"
              value={legajo}
              onChange={(e) => setLegajo(e.target.value)}
              required
              style={inputStyle}
            />
            {error && (
              <div style={{ color: "#ef4444", fontSize: "13px" }}>{error}</div>
            )}
            <button type="submit" disabled={loading} style={btnPrimary}>
              {loading ? "Buscando..." : "Buscar Pregunta"}
            </button>
            <span
              onClick={() => setView("login")}
              style={{ ...linkStyle, textAlign: "center" }}
            >
              Volver al Login
            </span>
          </form>
        )}

        {/* VISTA 3: RECUPERAR (RESPONDER) */}
        {view === "forgot_answer" && (
          <form
            onSubmit={handleResetPassword}
            style={{ display: "flex", flexDirection: "column", gap: "15px" }}
          >
            <h3 style={{ margin: 0, color: "var(--text-primary)" }}>
              Seguridad
            </h3>
            <div
              style={{
                background: "var(--status-available-bg)",
                padding: "12px",
                borderRadius: "8px",
                color: "var(--status-available-text)",
                fontSize: "14px",
                border: "1px solid var(--status-available-border)",
              }}
            >
              <strong>Pregunta:</strong> {recoveredQuestion}
            </div>
            <input
              placeholder="Tu respuesta"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              required
              style={inputStyle}
            />
            <input
              type="password"
              placeholder="Nueva contraseña"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              style={inputStyle}
            />
            {error && (
              <div style={{ color: "#ef4444", fontSize: "13px" }}>{error}</div>
            )}
            <button type="submit" disabled={loading} style={btnPrimary}>
              {loading ? "Verificando..." : "Cambiar Contraseña"}
            </button>
            <span
              onClick={() => setView("login")}
              style={{ ...linkStyle, textAlign: "center" }}
            >
              Cancelar
            </span>
          </form>
        )}
      </div>
    </div>
  );
}
