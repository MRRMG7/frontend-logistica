import { useState } from "react";
import type { FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname || "/";

  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!usuario || !password) {
      setError("Ingresá tu usuario y contraseña.");
      return;
    }
    setCargando(true);
    try {
      const data = await login(usuario, password);
      const destino =
        from && from !== "/"
          ? from
          : data.rol === "ADMIN"
            ? "/admin"
            : data.rol === "CONDUCTOR"
              ? "/conductor"
              : "/";
      navigate(destino, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo conectar con el servidor.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="pantalla">
      <section className="panel-marca">
        <div className="marca">
          <span className="marca-icono" aria-hidden="true">
            <svg viewBox="0 0 32 32" width="22" height="22">
              <path d="M4 20 C 9 8, 18 22, 28 6" fill="none" stroke="#2ec4b6" strokeWidth="2.6" strokeLinecap="round" />
              <circle cx="4" cy="20" r="3" fill="#f5a623" />
              <circle cx="28" cy="6" r="3" fill="#f5a623" />
            </svg>
          </span>
          <span className="marca-texto">Transporte &amp; Entregas</span>
        </div>
        <h1 className="titular">
          Cada pedido,
          <br />
          visible en su ruta.
        </h1>
        <p className="subtitular">
          Administradores, conductores y clientes comparten un solo lugar para saber dónde va cada entrega y en qué estado está.
        </p>
      </section>

      <section className="panel-form">
        <form onSubmit={enviar} className="form-login">
          <h2 className="form-titulo">Iniciar sesión</h2>
          <p className="form-subtitulo">Ingresá con tus credenciales para acceder al panel.</p>

          <label className="label">
            Usuario
            <input
              className="input"
              type="text"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              autoComplete="username"
              placeholder="usuario"
            />
          </label>

          <label className="label">
            Contraseña
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </label>

          {error && <p className="error">{error}</p>}

          <button className="btn-primario" type="submit" disabled={cargando}>
            {cargando ? "Ingresando..." : "Ingresar"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="mt-3 w-full rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            Volver al inicio
          </button>
        </form>
      </section>
    </main>
  );
}