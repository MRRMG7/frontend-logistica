import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";

interface DatosRegistro {
  nombre: string;
  telefono: string;
  email: string;
  direccion: string;
  username: string;
  password: string;
}

export default function Registro() {
  const navigate = useNavigate();
  const [datos, setDatos] = useState<DatosRegistro>({
    nombre: "",
    telefono: "",
    email: "",
    direccion: "",
    username: "",
    password: "",
  });
  const [confirmacion, setConfirmacion] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  function actualizar(campo: keyof DatosRegistro, valor: string) {
    setDatos((actuales) => ({ ...actuales, [campo]: valor }));
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (datos.password !== confirmacion) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setCargando(true);
    try {
      await api<unknown>("/registro", {
        method: "POST",
        body: JSON.stringify({
          ...datos,
          nombre: datos.nombre.trim(),
          telefono: datos.telefono.trim(),
          email: datos.email.trim(),
          direccion: datos.direccion.trim(),
          username: datos.username.trim(),
        }),
      });
      navigate("/login", { replace: true, state: { registroCompletado: true } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear la cuenta. Intentá de nuevo.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="pantalla pantalla-registro">
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
          Tu cuenta,
          <br />
          tus entregas.
        </h1>
        <p className="subtitular">
          Registrate para consultar el estado de tus pedidos y mantener actualizados tus datos de contacto.
        </p>
        <p className="pie-marca">Sistema de Gestión de Transporte y Entregas · El Salvador</p>
      </section>

      <section className="panel-formulario">
        <div className="tarjeta-login tarjeta-registro">
          <form onSubmit={enviar} className="form-login">
            <h2 className="form-titulo">Crear cuenta de cliente</h2>
            <p className="form-subtitulo">Completá tus datos para registrarte.</p>

            <div className="registro-grid">
              <label className="campo">
                Nombre completo
                <input
                  required
                  autoComplete="name"
                  value={datos.nombre}
                  onChange={(e) => actualizar("nombre", e.target.value)}
                />
              </label>
              <label className="campo">
                Teléfono
                <input
                  required
                  type="tel"
                  autoComplete="tel"
                  value={datos.telefono}
                  onChange={(e) => actualizar("telefono", e.target.value)}
                />
              </label>
              <label className="campo">
                Correo electrónico
                <input
                  required
                  type="email"
                  autoComplete="email"
                  value={datos.email}
                  onChange={(e) => actualizar("email", e.target.value)}
                />
              </label>
              <label className="campo">
                Dirección
                <input
                  required
                  autoComplete="street-address"
                  value={datos.direccion}
                  onChange={(e) => actualizar("direccion", e.target.value)}
                />
              </label>
              <label className="campo">
                Usuario
                <input
                  required
                  autoComplete="username"
                  value={datos.username}
                  onChange={(e) => actualizar("username", e.target.value)}
                />
              </label>
              <label className="campo">
                Contraseña
                <input
                  required
                  type="password"
                  autoComplete="new-password"
                  value={datos.password}
                  onChange={(e) => actualizar("password", e.target.value)}
                />
              </label>
              <label className="campo campo-completo">
                Confirmar contraseña
                <input
                  required
                  type="password"
                  autoComplete="new-password"
                  value={confirmacion}
                  onChange={(e) => setConfirmacion(e.target.value)}
                />
              </label>
            </div>

            {error && <p className="error-login" role="alert">{error}</p>}

            <button className="btn-entrar" type="submit" disabled={cargando}>
              {cargando ? "Creando cuenta…" : "Crear cuenta"}
            </button>
            <p className="registro-login">
              ¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link>
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
