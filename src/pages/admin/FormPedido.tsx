import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { api } from "../../api";
import { geocodificar, geocodificarInversa } from "../../geo";
import { estaDentroDeElSalvador, ESTILO_MAPA, LIMITES_EL_SALVADOR } from "../../mapa";
import type { Cliente, Conductor, Pedido, Vehiculo } from "../../types";

interface Props {
  pedido?: Pedido | null;
  clientes?: Cliente[];
  conductores?: Conductor[];
  vehiculos?: Vehiculo[];
  iniciales?: { latitud: number; longitud: number; direccion: string };
  onCerrar: () => void;
  onGuardado: () => Promise<void>;
}

const sinAcentos = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

export default function FormPedido({
  pedido,
  clientes,
  conductores,
  vehiculos,
  iniciales,
  onCerrar,
  onGuardado,
}: Props) {
  const [clientesFetched, setClientesFetched] = useState<Cliente[]>(clientes ?? []);
  const [vehiculosFetched, setVehiculosFetched] = useState<Vehiculo[]>(vehiculos ?? []);
  const [idCliente, setIdCliente] = useState(pedido?.id_cliente ?? 0);
  const [nombreCliente, setNombreCliente] = useState("");
  const [sugerencias, setSugerencias] = useState<Cliente[]>([]);
  const [sugerenciasAbiertas, setSugerenciasAbiertas] = useState(false);
  const [idConductor, setIdConductor] = useState(pedido?.id_conductor ?? 0);
  const [idVehiculo, setIdVehiculo] = useState(pedido?.id_vehiculo ?? 0);
  const [direccion, setDireccion] = useState(pedido?.direccion ?? iniciales?.direccion ?? "");
  const [latitud, setLatitud] = useState(pedido?.latitud ?? iniciales?.latitud ?? 13.6929);
  const [longitud, setLongitud] = useState(pedido?.longitud ?? iniciales?.longitud ?? -89.2182);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);
  const mapaCont = useRef<HTMLDivElement>(null);
  const pinRef = useRef<maplibregl.Marker | null>(null);
  const coordsValidasRef = useRef({ lat: latitud, lng: longitud });
  coordsValidasRef.current = { lat: latitud, lng: longitud };

  useEffect(() => {
    if (!clientesFetched.length) {
      api<Cliente[]>("/clientes").then(setClientesFetched).catch(() => {});
    }
    if (!vehiculosFetched.length) {
      api<Vehiculo[]>("/vehiculos").then(setVehiculosFetched).catch(() => {});
    }
  }, [clientesFetched.length, vehiculosFetched.length]);

  useEffect(() => {
    if (nombreCliente.trim() || !pedido?.id_cliente || !clientesFetched.length) return;
    const c = clientesFetched.find((x) => x.id_cliente === pedido.id_cliente);
    if (c) setNombreCliente(c.nombre);
  }, [clientesFetched, nombreCliente, pedido]);

  const calcularSugerencias = (valor: string) => {
    const n = sinAcentos(valor);
    return n
      ? clientesFetched.filter((c) => sinAcentos(c.nombre).includes(n)).slice(0, 8)
      : clientesFetched.slice(0, 8);
  };

  const coincideConAlguno = (valor: string) => {
    const n = sinAcentos(valor);
    return n !== "" && clientesFetched.some((c) => sinAcentos(c.nombre).includes(n));
  };

  const escribirNombreCliente = (valor: string) => {
    setNombreCliente(valor);
    setSugerenciasAbiertas(true);
    setIdCliente(
      clientesFetched.find((c) => sinAcentos(c.nombre) === sinAcentos(valor))?.id_cliente ?? 0,
    );
    setSugerencias(calcularSugerencias(valor));
  };

  const abrirSugerencias = () => {
    setSugerenciasAbiertas(true);
    setSugerencias(calcularSugerencias(nombreCliente));
  };

  const elegirCliente = (c: Cliente) => {
    setNombreCliente(c.nombre);
    setIdCliente(c.id_cliente);
    setSugerencias([]);
    setSugerenciasAbiertas(false);
  };

  const nombreClienteParcial =
    nombreCliente.trim() !== "" && idCliente === 0 && coincideConAlguno(nombreCliente);
  const clienteEsNuevo =
    nombreCliente.trim() !== "" && idCliente === 0 && !coincideConAlguno(nombreCliente);

  useEffect(() => {
    const cont = mapaCont.current;
    if (!cont) return;
    const inicial = [longitud || -89.2182, latitud || 13.6929] as [number, number];
    const mapa = new maplibregl.Map({
      container: cont,
      style: ESTILO_MAPA,
      center: inicial,
      zoom: 14,
      maxBounds: LIMITES_EL_SALVADOR,
    });
    const pin = new maplibregl.Marker({ color: "#e53e3e", draggable: true })
      .setLngLat(inicial)
      .addTo(mapa);
    pinRef.current = pin;
    const aplicar = (lng: number, lat: number) => {
      if (!estaDentroDeElSalvador(lat, lng)) {
        setError("El punto de entrega debe estar dentro de El Salvador.");
        pin.setLngLat([coordsValidasRef.current.lng, coordsValidasRef.current.lat]);
        return;
      }
      setError("");
      setLongitud(lng);
      setLatitud(lat);
      geocodificarInversa(lat, lng).then((dir) => {
        if (dir) setDireccion(dir);
      });
    };
    pin.on("dragend", () => {
      const p = pin.getLngLat();
      aplicar(p.lng, p.lat);
    });
    mapa.on("click", (e) => {
      pin.setLngLat(e.lngLat);
      aplicar(e.lngLat.lng, e.lngLat.lat);
    });
    return () => {
      mapa.remove();
      pinRef.current = null;
    };
  }, []);

  useEffect(() => {
    const pin = pinRef.current;
    if (!pin || !Number.isFinite(latitud) || !Number.isFinite(longitud)) return;
    pin.setLngLat([longitud, latitud]);
  }, [latitud, longitud]);

  async function ubicarDireccion() {
    setError("");
    const texto = direccion.trim();
    if (!texto) return setError("Escribí la dirección para ubicarla en el mapa.");
    try {
      const res = await geocodificar(texto);
      if (!estaDentroDeElSalvador(res.lat, res.lon)) {
        return setError("La dirección debe estar dentro de El Salvador.");
      }
      setLatitud(res.lat);
      setLongitud(res.lon);
      pinRef.current?.setLngLat([res.lon, res.lat]);
      if (res.nombre) setDireccion(res.nombre);
    } catch {
      setError("No se encontró la dirección. Arrastrá el pin rojo en el mapa.");
    }
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setError("");
    const nombre = nombreCliente.trim();
    if (!nombre) return setError("Escribí el nombre del cliente.");
    if (!direccion.trim()) return setError("Completá la dirección.");
    if (!Number.isFinite(latitud) || !Number.isFinite(longitud)) return setError("Las coordenadas son obligatorias.");
    if (!estaDentroDeElSalvador(latitud, longitud)) {
      return setError("El punto de entrega debe estar dentro de El Salvador.");
    }

    let clienteId =
      idCliente ||
      clientesFetched.find((c) => sinAcentos(c.nombre) === sinAcentos(nombre))?.id_cliente ||
      0;

    // Si el nombre coincide a medias con alguien de la lista, no se crea nada: hay que elegir.
    if (!clienteId && coincideConAlguno(nombre)) {
      return setError(`"${nombre}" coincide con un cliente de la lista. Elegilo para continuar.`);
    }

    setGuardando(true);
    try {
      if (!clienteId) {
        const nuevo = await api<Cliente>("/clientes", {
          method: "POST",
          body: JSON.stringify({
            nombre,
            telefono: "",
            email: "sin@correo.sv",
            direccion: "",
          }),
        });
        clienteId = nuevo.id_cliente;
      }

      const cuerpo = {
        id_cliente: Number(clienteId),
        direccion: direccion.trim(),
        latitud: Number(latitud),
        longitud: Number(longitud),
        id_conductor: idConductor ? Number(idConductor) : null,
        id_vehiculo: idVehiculo ? Number(idVehiculo) : null,
        estado: "PENDIENTE" as const,
      };

      if (pedido) {
        const prev = pedido.estado;
        await api(`/pedidos/${pedido.id_pedido}`, {
          method: "PUT",
          body: JSON.stringify({ ...cuerpo, estado: prev }),
        });
      } else {
        await api("/pedidos", { method: "POST", body: JSON.stringify(cuerpo) });
      }
      await onGuardado();
      onCerrar();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar el pedido.");
    } finally {
      setGuardando(false);
    }
  }

  const inputCls =
    "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none";
  const labelCls = "mb-1 block text-sm font-medium text-slate-700";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 overflow-y-auto">
      <form
        onSubmit={enviar}
        className="mt-10 w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
      >
        <h3 className="text-lg font-bold text-slate-800">
          {pedido ? `Editar pedido #${pedido.id_pedido}` : "Nuevo pedido"}
        </h3>
        {pedido && (
          <p className="mt-1 text-xs font-medium text-slate-500">
            Nº de seguimiento:{" "}
            <span className="font-mono font-semibold text-slate-700">#{pedido.id_pedido}</span>
          </p>
        )}

        {error && (
          <p className="mt-3 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </p>
        )}

        <div className="mt-4 space-y-4">
          <div className="relative">
            <label className={labelCls}>Cliente</label>
            <input
              value={nombreCliente}
              onChange={(e) => escribirNombreCliente(e.target.value)}
              onFocus={abrirSugerencias}
              onBlur={() => window.setTimeout(() => setSugerenciasAbiertas(false), 150)}
              className={inputCls}
              placeholder="Escribí el nombre del cliente"
              autoComplete="off"
            />
            {sugerenciasAbiertas && sugerencias.length > 0 && (
              <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-slate-300 bg-white py-1 shadow-lg">
                {sugerencias.map((c) => (
                  <li key={c.id_cliente}>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => elegirCliente(c)}
                      className="block w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                    >
                      {c.nombre}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {nombreClienteParcial && (
              <p className="mt-1 text-xs text-amber-600">
                Ese nombre coincide con un cliente de la lista. Elegilo para continuar.
              </p>
            )}
            {clienteEsNuevo && (
              <p className="mt-1 text-xs text-slate-500">
                No hay nadie con ese nombre. Se creará el cliente «{nombreCliente.trim()}» al guardar.
              </p>
            )}
          </div>

          {(conductores || []).length > 0 && (
            <div>
              <label className={labelCls}>Conductor</label>
              <select
                value={idConductor}
                onChange={(e) => setIdConductor(Number(e.target.value))}
                className={inputCls}
              >
                <option value={0}>— Sin asignar —</option>
                {conductores?.map((c) => (
                  <option key={c.id_conductor} value={c.id_conductor}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className={labelCls}>Vehículo</label>
            <select
              value={idVehiculo}
              onChange={(e) => setIdVehiculo(Number(e.target.value))}
              className={inputCls}
            >
              <option value={0}>— Sin asignar —</option>
              {vehiculosFetched.map((v) => (
                <option key={v.id_vehiculo} value={v.id_vehiculo}>
                  {v.tipo} ({v.placa})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>Dirección</label>
            <div className="flex gap-2">
              <input
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                className={inputCls}
                placeholder="Dirección de entrega"
              />
              <button
                type="button"
                onClick={ubicarDireccion}
                className="btn btn-ambar"
                style={{ whiteSpace: "nowrap" }}
              >
                Ubicar
              </button>
            </div>
          </div>

          <div>
            <div className="h-[220px] w-full overflow-hidden rounded-lg border border-slate-300">
              <div ref={mapaCont} className="h-full w-full" />
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Arrastrá el pin rojo o hacé clic en el mapa para ajustar la dirección y las coordenadas.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Latitud</label>
              <input
                value={latitud}
                onChange={(e) => setLatitud(Number(e.target.value))}
                className={inputCls}
                step="any"
              />
            </div>
            <div>
              <label className={labelCls}>Longitud</label>
              <input
                value={longitud}
                onChange={(e) => setLongitud(Number(e.target.value))}
                className={inputCls}
                step="any"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCerrar}
            className="btn"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={guardando}
            className="btn btn-verde"
          >
            {guardando ? "Guardando…" : pedido ? "Actualizar" : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
}
