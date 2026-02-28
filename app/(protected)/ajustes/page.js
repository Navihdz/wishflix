"use client";

import { useEffect, useState } from "react";

export default function AjustesPage() {
  const [spaces, setSpaces] = useState([]);
  const [activeSpaceId, setActiveSpaceId] = useState(null);
  const [joinCode, setJoinCode] = useState("");
  const [newTeamName, setNewTeamName] = useState("");
  const [mergeFromActive, setMergeFromActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [okMessage, setOkMessage] = useState("");

  async function loadSpaces() {
    setLoading(true);
    setError("");
    const response = await fetch("/api/spaces/me");
    setLoading(false);
    if (!response.ok) {
      const data = await response.json();
      setError(data.error || "No se pudieron cargar los equipos");
      return;
    }
    const data = await response.json();
    setSpaces(data.spaces || []);
    setActiveSpaceId(data.activeSpaceId || null);
  }

  useEffect(() => {
    loadSpaces();
  }, []);

  async function createTeam() {
    setLoading(true);
    setError("");
    setOkMessage("");
    const response = await fetch("/api/spaces/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newTeamName || undefined, setActive: true })
    });
    setLoading(false);
    if (!response.ok) {
      const data = await response.json();
      setError(data.error || "No se pudo crear el equipo");
      return;
    }
    setNewTeamName("");
    setOkMessage("Equipo creado");
    loadSpaces();
  }

  async function joinTeam() {
    setLoading(true);
    setError("");
    setOkMessage("");
    const response = await fetch("/api/spaces/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ joinCode, mergeFromActive })
    });
    setLoading(false);
    if (!response.ok) {
      const data = await response.json();
      setError(data.error || "No se pudo unir al equipo");
      return;
    }
    setJoinCode("");
    setOkMessage("Te uniste al equipo");
    loadSpaces();
  }

  async function switchActive(spaceId) {
    setLoading(true);
    setError("");
    const response = await fetch("/api/spaces/switch-active", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ spaceId })
    });
    setLoading(false);
    if (!response.ok) {
      const data = await response.json();
      setError(data.error || "No se pudo cambiar el equipo activo");
      return;
    }
    setActiveSpaceId(spaceId);
    setOkMessage("Equipo activo actualizado");
  }

  const activeSpace = spaces.find((space) => space.id === activeSpaceId);

  return (
    <section>
      <h1 className="section-title">Ajustes de equipo</h1>
      {loading ? <p className="empty">Cargando...</p> : null}
      {error ? <p style={{ color: "#ef476f" }}>{error}</p> : null}
      {okMessage ? <p style={{ color: "#27c281" }}>{okMessage}</p> : null}

      <div className="settings-panel">
        <h3 style={{ marginTop: 0 }}>Equipo activo</h3>
        <p className="row-sub">{activeSpace ? activeSpace.name : "Sin equipo activo"}</p>
        {activeSpace ? <p className="row-sub">Codigo para invitar: {activeSpace.joinCode}</p> : null}
      </div>

      <div className="settings-panel">
        <h3 style={{ marginTop: 0 }}>Mis equipos</h3>
        {!spaces.length ? <p className="row-sub">No hay equipos.</p> : null}
        {spaces.map((space) => (
          <div key={space.id} className="space-row">
            <div>
              <strong>{space.name}</strong>
              <p className="row-sub">Codigo: {space.joinCode}</p>
            </div>
            {space.id === activeSpaceId ? (
              <span className="badge">Activo</span>
            ) : (
              <button className="btn btn-ghost" onClick={() => switchActive(space.id)}>
                Activar
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="settings-panel">
        <h3 style={{ marginTop: 0 }}>Crear equipo</h3>
        <input
          className="search"
          placeholder="Nombre del nuevo equipo (opcional)"
          value={newTeamName}
          onChange={(e) => setNewTeamName(e.target.value)}
        />
        <button className="btn btn-primary" onClick={createTeam} disabled={loading}>
          Crear equipo
        </button>
      </div>

      <div className="settings-panel">
        <h3 style={{ marginTop: 0 }}>Unirme con codigo</h3>
        <input className="search" placeholder="Codigo del equipo" value={joinCode} onChange={(e) => setJoinCode(e.target.value)} />
        <label className="checkbox-row">
          <input type="checkbox" checked={mergeFromActive} onChange={(e) => setMergeFromActive(e.target.checked)} />
          Fusionar mi wishlist actual al unirme.
        </label>
        <button className="btn btn-primary" onClick={joinTeam} disabled={loading || !joinCode.trim()}>
          Unirme
        </button>
      </div>
    </section>
  );
}

