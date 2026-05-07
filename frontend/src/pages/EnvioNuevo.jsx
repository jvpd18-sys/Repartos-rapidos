import { Calendar, MapPin, Package, User2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { api } from "../api/client.js";
import Card from "../components/ui/Card.jsx";
import StepIndicator from "../components/ui/StepIndicator.jsx";
import { formatoMoneda, formatoVentana } from "../i18n/format.js";

const PASOS = ["Remitente", "Destinatario", "Paquete y servicio"];

export default function EnvioNuevo() {
  const nav = useNavigate();
  const [paso, setPaso] = useState(2);
  const [ciudades, setCiudades] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  const [remitente, setRemitente] = useState({
    nombre: "Ana Martínez",
    telefono: "+57 310 445 9821",
    direccion: "Cra 45 #12-80, Apto 302",
    ciudad_id: 1,
  });
  const [destinatario, setDestinatario] = useState({
    nombre: "Carlos Ramírez",
    telefono: "+57 321 778 4512",
    direccion: "Calle 98 #8-55, Torre B",
    ciudad_id: 2,
  });
  const [paquete, setPaquete] = useState({
    peso_kg: 2.4,
    dimensiones_cm: "30 x 20 x 15",
    tipo_paquete_id: 1,
    valor_declarado: 180000,
  });
  const [servicioId, setServicioId] = useState(2);
  const [notas, setNotas] = useState("Llamar al llegar, portería no recibe paquetes.");

  useEffect(() => {
    Promise.all([
      api.get("/catalogos/ciudades"),
      api.get("/catalogos/tipos-paquete"),
      api.get("/catalogos/servicios"),
    ]).then(([c, t, s]) => {
      setCiudades(c.data);
      setTipos(t.data);
      setServicios(s.data);
    });
  }, []);

  const servicio = servicios.find((s) => s.id === servicioId);

  const costos = useMemo(() => {
    if (!servicio) return { subtotal: 0, seguro: 0, iva: 0, total: 0 };
    const subtotal = servicio.tarifa_base;
    const seguro = Math.round(paquete.valor_declarado * 0.01);
    const iva = Math.round(subtotal * 0.19);
    return { subtotal, seguro, iva, total: subtotal + seguro + iva };
  }, [servicio, paquete.valor_declarado]);

  const fechaEstimada = useMemo(() => {
    if (!servicio) return null;
    const f = new Date();
    let agregados = 0;
    while (agregados < servicio.dias_max) {
      f.setDate(f.getDate() + 1);
      if (f.getDay() !== 0 && f.getDay() !== 6) agregados++;
    }
    f.setHours(14, 0, 0, 0);
    return f.toISOString();
  }, [servicio]);

  const crear = async () => {
    setEnviando(true);
    setError("");
    try {
      const resp = await api.post("/paquetes", {
        remitente,
        destinatario,
        paquete: { ...paquete, peso_kg: Number(paquete.peso_kg), valor_declarado: Number(paquete.valor_declarado) },
        servicio_id: servicioId,
        notas_entrega: notas || null,
      });
      nav(`/envios/${resp.data.id}/confirmacion`);
    } catch (err) {
      setError(err?.response?.data?.detail || "No pudimos crear el envío. Verifica los datos e intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-medium text-texto-500">
            <Link to="/envios" className="hover:underline">Envíos</Link> <span className="text-texto-400">›</span> Nuevo envío
          </p>
          <h1 className="text-2xl font-bold text-texto-900">Crear nuevo envío</h1>
        </div>
        <div className="flex gap-2">
          <Link
            to="/envios"
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-texto-700 hover:bg-slate-50"
          >
            Cancelar
          </Link>
          <button
            onClick={crear}
            disabled={enviando}
            className="rounded-lg bg-marca px-4 py-2 text-sm font-semibold text-white shadow-marca hover:bg-marca-oscuro disabled:opacity-60"
          >
            {enviando ? "Creando…" : "✓ Crear envío"}
          </button>
        </div>
      </header>

      <Card>
        <StepIndicator pasos={PASOS} actual={paso} />
      </Card>

      {error && (
        <p className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-critico">{error}</p>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <PersonaCard
            titulo="Remitente"
            icono={User2}
            color="#2563EB"
            datos={remitente}
            setDatos={setRemitente}
            ciudades={ciudades}
            activo={paso === 1}
            onFocus={() => setPaso(1)}
          />
          <PersonaCard
            titulo="Destinatario"
            icono={MapPin}
            color="#16A34A"
            datos={destinatario}
            setDatos={setDestinatario}
            ciudades={ciudades}
            activo={paso === 2}
            onFocus={() => setPaso(2)}
            mostrarNotas
            notas={notas}
            setNotas={setNotas}
          />
          <Card titulo="Detalles del paquete" icono={Package} iconoColor="#F59E0B">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Campo label="Peso (kg)">
                <input
                  type="number"
                  step="0.1"
                  value={paquete.peso_kg}
                  onChange={(e) => setPaquete({ ...paquete, peso_kg: e.target.value })}
                  onFocus={() => setPaso(3)}
                  className={inputCls}
                />
              </Campo>
              <Campo label="Dimensiones (cm)">
                <input
                  type="text"
                  value={paquete.dimensiones_cm}
                  onChange={(e) => setPaquete({ ...paquete, dimensiones_cm: e.target.value })}
                  onFocus={() => setPaso(3)}
                  className={inputCls}
                />
              </Campo>
              <Campo label="Valor declarado (COP)">
                <input
                  type="number"
                  value={paquete.valor_declarado}
                  onChange={(e) => setPaquete({ ...paquete, valor_declarado: e.target.value })}
                  onFocus={() => setPaso(3)}
                  className={inputCls}
                />
              </Campo>
            </div>
            <p className="mt-4 mb-2 text-xs font-medium text-texto-500">Tipo de paquete</p>
            <div className="flex flex-wrap gap-2">
              {tipos.map((t) => {
                const sel = paquete.tipo_paquete_id === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setPaquete({ ...paquete, tipo_paquete_id: t.id });
                      setPaso(3);
                    }}
                    className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                      sel
                        ? "border-marca bg-marca-claro text-marca"
                        : "border-slate-200 bg-white text-texto-700 hover:bg-slate-50"
                    }`}
                  >
                    {t.nombre}
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        <aside className="space-y-5">
          <Card titulo="Resumen del envío" icono={Package} iconoColor="#2563EB">
            <p className="mb-2 text-xs font-medium text-texto-500">Tipo de servicio</p>
            <div className="space-y-2">
              {servicios.map((s) => {
                const sel = servicioId === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setServicioId(s.id)}
                    className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left transition ${
                      sel
                        ? "border-marca bg-marca-claro"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`grid h-4 w-4 place-items-center rounded-full border ${
                          sel ? "border-marca" : "border-slate-300"
                        }`}
                      >
                        {sel && <span className="h-2 w-2 rounded-full bg-marca" />}
                      </span>
                      <div>
                        <p className={`text-sm font-semibold ${sel ? "text-marca" : "text-texto-900"}`}>
                          {s.nombre}
                        </p>
                        <p className="text-xs text-texto-500">
                          {s.dias_min === s.dias_max
                            ? `${s.dias_max} día${s.dias_max === 1 ? "" : "s"} hábiles`
                            : `${s.dias_min}-${s.dias_max} días hábiles`}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-texto-900">{formatoMoneda(s.tarifa_base)}</span>
                  </button>
                );
              })}
            </div>

            <div className="my-5 h-px bg-slate-100" />

            <ul className="space-y-2 text-sm">
              <li className="flex justify-between text-texto-700">
                <span>Subtotal</span><span>{formatoMoneda(costos.subtotal)}</span>
              </li>
              <li className="flex justify-between text-texto-700">
                <span>Seguro (1 % valor)</span><span>{formatoMoneda(costos.seguro)}</span>
              </li>
              <li className="flex justify-between text-texto-700">
                <span>IVA (19 %)</span><span>{formatoMoneda(costos.iva)}</span>
              </li>
            </ul>

            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
              <span className="text-sm font-semibold text-texto-900">Total</span>
              <span className="text-xl font-bold text-marca">{formatoMoneda(costos.total)}</span>
            </div>

            {fechaEstimada && (
              <div className="mt-5 flex items-start gap-3 rounded-xl bg-emerald-50 p-3 text-sm">
                <Calendar size={16} className="mt-0.5 text-exito" />
                <div>
                  <p className="font-semibold text-exito">Entrega estimada</p>
                  <p className="text-texto-700">{formatoVentana(fechaEstimada)}</p>
                </div>
              </div>
            )}
          </Card>
        </aside>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-marca focus:outline-none focus:ring-1 focus:ring-marca";

function Campo({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-texto-500">{label}</span>
      {children}
    </label>
  );
}

function PersonaCard({ titulo, icono, color, datos, setDatos, ciudades, activo, onFocus, mostrarNotas, notas, setNotas }) {
  return (
    <Card
      titulo={titulo}
      icono={icono}
      iconoColor={color}
      accion={
        activo && (
          <span className="rounded-full bg-marca-claro px-2 py-0.5 text-[10px] font-semibold uppercase text-marca">
            Paso actual
          </span>
        )
      }
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Campo label="Nombre completo">
          <input
            type="text"
            value={datos.nombre}
            onChange={(e) => setDatos({ ...datos, nombre: e.target.value })}
            onFocus={onFocus}
            className={`${inputCls} ${activo ? "border-marca ring-1 ring-marca" : ""}`}
          />
        </Campo>
        <Campo label="Teléfono">
          <input
            type="tel"
            value={datos.telefono}
            onChange={(e) => setDatos({ ...datos, telefono: e.target.value })}
            onFocus={onFocus}
            className={inputCls}
          />
        </Campo>
        <Campo label="Dirección">
          <input
            type="text"
            value={datos.direccion}
            onChange={(e) => setDatos({ ...datos, direccion: e.target.value })}
            onFocus={onFocus}
            className={inputCls}
          />
        </Campo>
        <Campo label="Ciudad">
          <select
            value={datos.ciudad_id}
            onChange={(e) => setDatos({ ...datos, ciudad_id: Number(e.target.value) })}
            onFocus={onFocus}
            className={inputCls}
          >
            {ciudades.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </Campo>
      </div>
      {mostrarNotas && (
        <div className="mt-4">
          <Campo label="Notas de entrega (opcional)">
            <textarea
              rows={2}
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              onFocus={onFocus}
              className={`${inputCls} resize-none`}
              placeholder="Llamar al llegar, portería no recibe paquetes."
            />
          </Campo>
        </div>
      )}
    </Card>
  );
}
