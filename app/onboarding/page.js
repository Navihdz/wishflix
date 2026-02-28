"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [teamName, setTeamName] = useState("");
  const [mergeFromActive, setMergeFromActive] = useState(true);
  const [error, setError] = useState("");
  const [loadingAction, setLoadingAction] = useState("");

  async function createTeam() {
    setLoadingAction("create");
    setError("");
    const response = await fetch("/api/spaces/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: teamName || undefined, setActive: true })
    });
    setLoadingAction("");
    if (!response.ok) {
      const data = await response.json();
      setError(data.error || "No se pudo crear equipo");
      return;
    }
    router.push("/inicio");
    router.refresh();
  }

  async function joinTeam() {
    setLoadingAction("join");
    setError("");
    const response = await fetch("/api/spaces/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ joinCode: code, mergeFromActive })
    });
    setLoadingAction("");
    if (!response.ok) {
      const data = await response.json();
      setError(data.error || "No se pudo unir al equipo");
      return;
    }
    router.push("/inicio");
    router.refresh();
  }

  return (
    <div className="login-wrap">
      <div className="login-card">
        <h1 style={{ marginTop: 0 }}>Configura tu espacio</h1>
        <p style={{ color: "#9db0cc" }}>Puedes crear equipo, unirte con codigo o continuar solo.</p>

        <div className="settings-panel">
          <h3 style={{ marginTop: 0 }}>Crear equipo</h3>
          <input
            className="search"
            placeholder="Nombre del equipo (opcional)"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
          />
          <button className="btn btn-primary" onClick={createTeam} disabled={loadingAction === "create"}>
            {loadingAction === "create" ? "Creando..." : "Crear y usar este equipo"}
          </button>
        </div>

        <div className="settings-panel" style={{ marginTop: ".8rem" }}>
          <h3 style={{ marginTop: 0 }}>Unirme con codigo</h3>
          <input className="search" placeholder="Codigo del equipo" value={code} onChange={(e) => setCode(e.target.value)} />
          <label className="checkbox-row">
            <input type="checkbox" checked={mergeFromActive} onChange={(e) => setMergeFromActive(e.target.checked)} />
            Fusionar mi wishlist actual (dedup y estado final wishlist).
          </label>
          <button className="btn btn-primary" onClick={joinTeam} disabled={loadingAction === "join" || !code.trim()}>
            {loadingAction === "join" ? "Uniendo..." : "Unirme"}
          </button>
        </div>

        <button className="btn btn-ghost" onClick={() => router.push("/inicio")} style={{ width: "100%", marginTop: ".9rem" }}>
          Continuar por ahora
        </button>

        {error ? <p style={{ color: "#ef476f", marginBottom: 0 }}>{error}</p> : null}
      </div>
    </div>
  );
}

