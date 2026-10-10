import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useAuth } from "../auth";
import { api, ESTADO_META } from "../api";
import EstadoPill from "../components/EstadoPill";
import { estaDentroDeElSalvador, ESTILO_MAPA, LIMITES_EL_SALVADOR } from "../mapa";
import type { Cliente, Pedido } from "../types";

const ETAPAS: Pedido["estado"][] = ["PENDIENTE", "ASIGNADO", "EN_CAMINO", "ENTREGADO"];
const AVANCE: Record<Pedido["estado"], number> = {
  PENDIENTE: 1,
  ASIGNADO: 2,
  EN_CAMINO: 3,
  ENTREGADO: 4,
  INCIDENCIA: 2,
  CANCELADO: 1,
};

function MapaPedido({ pedido }: { pedido: Pedido }) {
  const contenedor = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contenedor.current) return;
    const lng = Number(pedido.longitud);
    const lat = Number(pedido.latitud);
    if (!estaDentroDeElSalvador(lat, lng)) return;

    const mapa = new maplibregl.Map({
      container: contenedor.current,
      style: ESTILO_MAPA,
      center: [lng, lat],
      zoom: 12,
      maxBounds: LIMITES_EL_SALVADOR,
    });
    new maplibregl.Marker({ color: "#e53e3e" })
      .setLngLat([lng, lat])
      .addTo(mapa);
    return () => {
      mapa.remove();
    };
  }, [pedido]);

  if (!estaDentroDeElSalvador(Number(pedido.latitud), Number(pedido.longitud))) {
    return <p className="entrega-vacio">No hay una ubicación válida dentro de El Salvador para este pedido.</p>;
  }
  return <div ref={contenedor} className="h-[260px] w-full" aria-label={`Mapa del pedido ${pedido.id_pedido}`} />;
}

export default function ClientePanel() {
  const { sesion, logout } = useAuth();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [seleccionado, setSeleccionado] = useState<number | null>(null);
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [direccion, setDireccion] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");

  const cargar = useCallback(async () => {
    if (!sesion?.id_ref) {
      setError("La cuenta no está asociada a un registro de cliente.");
      setCargando(false);
      return;
    }
    try {
      const [clientes, todosLosPedidos] = await Promise.all([
        api<Cliente[]>("/clientes"),
        api<Pedido[]>("/pedidos"),
      ]);
      const propio = (clientes || []).find((c) => c.id_cliente === sesion.id_ref) ?? null;
      const propios = (todosLosPedidos || [])
        .filter((p) => p.id_cliente === sesion.id_ref)
        .sort((a, b) => b.id_pedido - a.id_pedido);
      setCliente(propio);
      setPedidos(propios);
      setSeleccionado((actual) =>
        actual && propios.some((p) => p.id_pedido === actual)
          ? actual
          : propios[0]?.id_pedido ?? null,
      );
      if (propio) {
        setNombre(propio.nombre);
        setTelefono(propio.telefono);
        setEmail(propio.email || "");
        setDireccion(propio.direccion);
      } else {
        setError("No encontramos los datos de tu cuenta. Contactá al administrador.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar tus datos.");
    } finally {
      setCargando(false);
    }
  }, [sesion?.id_ref]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  useEffect(() => {
    const intervalo = window.setInterval(async () => {
      if (document.hidden || !sesion?.id_ref) return;
      try {
        const todosLosPedidos = await api<Pedido[]>("/pedidos");
        const propios = (todosLosPedidos || [])
          .filter((p) => p.id_cliente === sesion.id_ref)
          .sort((a, b) => b.id_pedido - a.id_pedido);
        setPedidos(propios);
        setSeleccionado((actual) =>
          actual && propios.some((p) => p.id_pedido === actual)
            ? actual
            : propios[0]?.id_pedido ?? null,
        );
      } catch {
        // El estado ya cargado sigue visible si la API falla temporalmente.
      }
    }, 5000);
    return () => window.clearInterval(intervalo);
  }, [sesion?.id_ref]);

  const pedidoSeleccionado = useMemo(
    () => pedidos.find((p) => p.id_pedido === seleccionado) ?? null,
    [pedidos, seleccionado],
  );

  async function guardarPerfil(e: FormEvent) {
    e.preventDefault();
    if (!cliente) return;
    setError("");
    setAviso("");
    if (!nombre.trim() || !telefono.trim() || !direccion.trim()) {
      setError("Completá nombre, teléfono y dirección.");
      return;
    }
    setGuardando(true);
    try {
      const actualizado = await api<Cliente>(`/clientes/${cliente.id_cliente}`, {
        method: "PUT",
        body: JSON.stringify({
          nombre: nombre.trim(),
          telefono: telefono.trim(),
          email: email.trim() || "sin@correo.sv",
          direccion: direccion.trim(),
        }),
      });
      setCliente(actualizado || {
        ...cliente,
        nombre: nombre.trim(),
        telefono: telefono.trim(),
        email: email.trim() || "sin@correo.sv",
        direccion: direccion.trim(),
      });
      setAviso("Tus datos se actualizaron correctamente.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron guardar tus datos.");
    } finally {
      setGuardando(false);
    }
  }

  const activas = pedidos.filter((p) => !["ENTREGADO", "CANCELADO"].includes(p.estado)).length;
  const enCamino = pedidos.filter((p) => p.estado === "EN_CAMINO").length;
  const entregadas = pedidos.filter((p) => p.estado === "ENTREGADO").length;

  return (
    <div className="conductor">
      <header className="conductor-top">
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
        <div className="conductor-usuario">
          <span>{cliente?.nombre || sesion?.nombre}</span>
          <button type="button" className="conductor-btn-salir" onClick={logout}>Cerrar sesión</button>
        </div>
      </header>

      <main className="conductor-cuerpo">
        <h1 className="conductor-saludo">Mi cuenta</h1>
        <p className="conductor-saludo-sub">Consultá tus entregas y mantené actualizados tus datos.</p>

        <div className="fila-conteos">
          <span className="contador">Pedidos activos: <b>{activas}</b></span>
          <span className="contador">En camino: <b>{enCamino}</b></span>
          <span className="contador">Entregados: <b>{entregadas}</b></span>
        </div>

        {error && <p className="aviso-banner rojo" role="alert">{error}</p>}
        {aviso && <p className="aviso-banner verde" role="status">{aviso}</p>}
        {cargando && <p className="entrega-vacio">Cargando tu cuenta…</p>}

        {!cargando && cliente && (
          <section className="tarjeta">
            <div className="cabecera-tarjeta">
              <h2>Mis datos</h2>
              <p>Esta información se usa para coordinar tus entregas.</p>
            </div>
            <div className="cuerpo-tarjeta">
              <form onSubmit={guardarPerfil}>
                <div className="form-grid-4 cliente-perfil-grid">
                  <label className="campo">
                    <span>Nombre completo</span>
                    <input value={nombre} onChange={(e) => setNombre(e.target.value)} autoComplete="name" />
                  </label>
                  <label className="campo">
                    <span>Teléfono</span>
                    <input value={telefono} onChange={(e) => setTelefono(e.target.value)} autoComplete="tel" />
                  </label>
                  <label className="campo">
                    <span>Correo</span>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
                  </label>
                  <label className="campo">
                    <span>Dirección</span>
                    <input value={direccion} onChange={(e) => setDireccion(e.target.value)} autoComplete="street-address" />
                  </label>
                </div>
                <div className="fila-acciones" style={{ marginTop: 14 }}>
                  <button className="btn btn-verde" type="submit" disabled={guardando}>
                    {guardando ? "Guardando…" : "Guardar cambios"}
                  </button>
                </div>
              </form>
            </div>
          </section>
        )}

        <section className="tarjeta">
          <div className="cabecera-tarjeta">
            <h2>Mis pedidos</h2>
            <p>Seleccioná un pedido para consultar su estado y ubicación de entrega.</p>
          </div>
          <div className="cuerpo-tarjeta">
            {pedidos.length === 0 ? (
              <p className="entrega-vacio">Todavía no tenés pedidos asociados a tu cuenta.</p>
            ) : (
              <div className="grid gap-4 lg:grid-cols-[minmax(260px,0.8fr)_minmax(0,1.2fr)]">
                <div className="space-y-3">
                  {pedidos.map((p) => (
                    <button
                      type="button"
                      key={p.id_pedido}
                      onClick={() => setSeleccionado(p.id_pedido)}
                      className="entrega-card w-full text-left"
                      aria-pressed={seleccionado === p.id_pedido}
                      style={{ borderColor: seleccionado === p.id_pedido ? "#0f9d8f" : undefined }}
                    >
                      <span className="entrega-top">
                        <span className="codigo-tracking">#{p.id_pedido}</span>
                        <EstadoPill estado={p.estado} />
                      </span>
                      <span className="entrega-dir">{p.direccion}</span>
                    </button>
                  ))}
                </div>

                {pedidoSeleccionado ? (
                  <div className="min-w-0">
                    <div className="entrega-card">
                      <div className="entrega-top">
                        <strong>Seguimiento #{pedidoSeleccionado.id_pedido}</strong>
                        <EstadoPill estado={pedidoSeleccionado.estado} />
                      </div>
                      <div className="pasos">
                        {ETAPAS.map((estado, i) => (
                          <div
                            key={estado}
                            className={`paso${i + 1 <= AVANCE[pedidoSeleccionado.estado] ? " hecho" : ""}${estado === pedidoSeleccionado.estado ? " activo" : ""}`}
                          >
                            <span className="paso-punto" />
                            <p className="paso-etiqueta">{ESTADO_META[estado].etiqueta}</p>
                          </div>
                        ))}
                      </div>
                      <p className="entrega-dir">{pedidoSeleccionado.direccion}</p>
                    </div>
                    <div className="mapa-wrap mt-3">
                      <MapaPedido pedido={pedidoSeleccionado} />
                    </div>
                  </div>
                ) : (
                  <p className="entrega-vacio">No hay un pedido seleccionado.</p>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
