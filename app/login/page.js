"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { readApiError } from "@/lib/http/api-error";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function checkSession() {
      const response = await fetch("/api/auth/session");
      if (!response.ok) return;
      const data = await response.json();
      if (!cancelled && data.authenticated) {
        router.replace("/inicio");
      }
    }
    checkSession();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);

    const isLogin = mode === "login";
    const response = await fetch(isLogin ? "/api/auth/login" : "/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(isLogin ? { email, password } : { name, email, password })
    });

    setLoading(false);
    if (!response.ok) {
      const message = await readApiError(response, "Error de autenticacion");
      setError(message);
      return;
    }

    if (isLogin) {
      router.push("/inicio");
      router.refresh();
      return;
    }

    setMode("login");
    setPassword("");
    setNotice("Cuenta creada correctamente. Ya puedes iniciar sesión.");
  }

  return (
    <div className="login-wrap">
      <form onSubmit={onSubmit} className="login-card">
        <div className="auth-mode-switch">
          <button
            type="button"
            className={`btn ${mode === "login" ? "btn-primary" : "btn-ghost"}`}
            onClick={() => {
              setMode("login");
              setError("");
              setNotice("");
            }}
          >
            Entrar
          </button>
          <button
            type="button"
            className={`btn ${mode === "register" ? "btn-primary" : "btn-ghost"}`}
            onClick={() => {
              setMode("register");
              setError("");
              setNotice("");
            }}
          >
            Crear cuenta
          </button>
        </div>

        <h1 style={{ marginTop: ".75rem" }}>{mode === "login" ? "Accede a tu wishlist" : "Crear cuenta"}</h1>
        {mode === "login" ? (
          <p style={{ color: "#9db0cc" }}>Si ya hay sesión válida, entrarás directo a inicio.</p>
        ) : (
          <p style={{ color: "#9db0cc" }}>Luego podrás crear equipo, unirte con código o continuar solo.</p>
        )}

        {mode === "register" ? (
          <>
            <label>Nombre</label>
            <input className="search" value={name} onChange={(e) => setName(e.target.value)} required />
          </>
        ) : null}

        <label>Email</label>
        <input className="search" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

        <label style={{ marginTop: ".6rem", display: "block" }}>Contraseña</label>
        <input className="search" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

        {error ? <p style={{ color: "#ef476f" }}>{error}</p> : null}
        {notice ? <p style={{ color: "#27c281" }}>{notice}</p> : null}
        <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: "100%", marginTop: ".8rem" }}>
          {loading ? "Procesando..." : mode === "login" ? "Ingresar" : "Crear usuario"}
        </button>
      </form>
    </div>
  );
}
