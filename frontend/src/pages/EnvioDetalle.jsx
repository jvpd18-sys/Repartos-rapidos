import { Calendar, MapPin, MessageSquare, Phone, Plus, Printer, Route, User2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { api } from "../api/client.js";
import Badge from "../components/ui/Badge.jsx";
import Card from "../components/ui/Card.jsx";
import Timeline from "../components/ui/Timeline.jsx";
import { formatoFechaCorta, formatoFechaLarga, formatoMoneda, formatoPeso } from "../i18n/format.js";

export default function EnvioDetalle() {
  const { id } = useParams();
  const [envio, setEnvio] = useState(null);
  const [repartidores, setRepartidores] = useState([]);
  const [accionando, setAccionando] = useState(false);

  const cargar = () => api.get(`/paquetes/${id}`).then((r) => setEnvio(r.data));

  useEffect(() => {
    cargar();
    api.get("/repartidores").then((r) => setRepartidores(r.data));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const reasignar = async () => {
    const disponibles = repartidores.filter((r) => r.estado !== "inactivo");
    if (!disponibles.length) return alert("No hay repartidores disponibles.");
    const otros = disponibles.filter((r) => r.id !== envio.repartidor?.id);
    const nuevo = otros[0] || disponibles[0];
    setAccionando(true);
    try {
      await api.put(`/paquetes/${envio.id}`, {
        repartidor_id: nuevo.id,
        estado_codigo: "en_reparto",
        descripcion: `Envío reasignado a ${nuevo.nombre}.`,
        ubicacion: envio.destinatario.ciudad,
      });
      await cargar();
    } finally {
      setAccionando(false);
    }
  };

  const cancelar = async () => {
    if (!window.confirm("¿Seguro que deseas cancelar este envío? Esta acción no se puede deshacer.")) return;
    setAccionando(true);
    try {
      await api.post(`/paquetes/${envio.id}/cancelar`);
      await cargar();
    } finally {
      setAccionando(false);
    }
  };

  const imprimir = () => {
    window.open(`/api/paquetes/${envio.id}/etiqueta`, "_blank");
  };

  if (!envio) return <p className="text-sm text-texto-500">Cargando…</p>;

  const progreso = Math.min(100, Math.round((envio.historial.length / 5) * 100));

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-medium text-texto-500">
            <Link to="/envios" className="hover:underline">Envíos</Link> <span className="text-texto-400">›</span>{" "}
            {envio.numero_guia}
          </p>
          <div className="mt-1 flex items-center gap-3">
            <h1 className="text-2xl font-bold text-texto-900">{envio.numero_guia}</h1>
            <Badge color={envio.estado.color}>{envio.estado.nombre}</Badge>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={imprimir}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-texto-700 hover:bg-slate-50"
          >
            <Printer size={14} /> Imprimir etiqueta
          </button>
          <button
            onClick={reasignar}
            disabled={accionando}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-texto-700 hover:bg-slate-50 disabled:opacity-60"
          >
            <Route size={14} /> Reasignar
          </button>
          <button
            onClick={cancelar}
            disabled={accionando || envio.estado.codigo === "cancelado"}
            className="flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-4 py-2 text-sm font-semibold text-critico hover:bg-red-100 disabled:opacity-60"
          >
            Cancelar envío
          </button>
        </div>
      </header>

      <Card>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          <Dato label="Servicio" valor={envio.servicio.nombre} />
          <Dato label="Peso" valor={formatoPeso(envio.peso_kg)} />
          <Dato label="Dimensiones" valor={`${envio.dimensiones_cm} cm`} />
          <Dato label="Valor declarado" valor={formatoMoneda(envio.valor_declarado)} />
          <Dato label="Creado" valor={formatoFechaCorta(envio.fecha_creacion)} />
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Card titulo="Remitente" icono={User2} iconoColor="#2563EB">
              <p className="text-base font-semibold text-texto-900">{envio.remitente.nombre}</p>
              <p className="mt-2 flex items-center gap-2 text-sm text-texto-700">
                <Phone size={14} /> {envio.remitente.telefono}
              </p>
              <p className="mt-1 flex items-start gap-2 text-sm text-texto-500">
                <MapPin size={14} className="mt-0.5" />
                {envio.remitente.direccion}, {envio.remitente.ciudad}
              </p>
            </Card>
            <Card titulo="Destinatario" icono={MapPin} iconoColor="#16A34A">
              <p className="text-base font-semibold text-texto-900">{envio.destinatario.nombre}</p>
              <p className="mt-2 flex items-center gap-2 text-sm text-texto-700">
                <Phone size={14} /> {envio.destinatario.telefono}
              </p>
              <p className="mt-1 flex items-start gap-2 text-sm text-texto-500">
                <MapPin size={14} className="mt-0.5" />
                {envio.destinatario.direccion} · {envio.destinatario.ciudad}, {envio.destinatario.departamento}
              </p>
            </Card>
          </div>

          <Card
            titulo="Historial del envío"
            accion={
              <button className="flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-xs font-medium text-texto-700">
                <Plus size={12} /> Agregar evento
              </button>
            }
          >
            <p className="-mt-2 mb-4 text-xs text-texto-500">
              {envio.historial.length} de 5 eventos registrados
            </p>
            <Timeline historial={envio.historial} />
          </Card>
        </div>

        <aside className="space-y-5">
          <Card
            titulo="Repartidor asignado"
            accion={
              <button
                onClick={reasignar}
                className="text-xs font-semibold text-marca hover:underline"
              >
                Cambiar
              </button>
            }
          >
            {envio.repartidor ? (
              <div>
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-amber-100 text-sm font-bold text-amber-700">
                    {envio.repartidor.nombre.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-texto-900">{envio.repartidor.nombre}</p>
                    <p className="text-xs text-texto-500">
                      <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-exito" />
                      {envio.repartidor.estado === "en_ruta" ? "En ruta" : "Disponible"} · {envio.repartidor.vehiculo}
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                  <BotonRed icon={Phone} label="Llamar" />
                  <BotonRed icon={MessageSquare} label="Chat" />
                  <BotonRed icon={Route} label="Ruta" />
                </div>
              </div>
            ) : (
              <p className="text-sm text-texto-500">Aún no se ha asignado un repartidor.</p>
            )}
          </Card>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <div className="flex items-center gap-2 text-exito">
              <Calendar size={16} />
              <p className="text-sm font-semibold">Entrega estimada</p>
            </div>
            <p className="mt-2 text-lg font-bold text-texto-900">{formatoFechaLarga(envio.fecha_estimada)}</p>
            <p className="mt-1 text-xs text-texto-500">Ventana 8:00 AM – 2:00 PM · A tiempo</p>
            <div className="mt-3">
              <div className="h-2 w-full overflow-hidden rounded-full bg-emerald-200">
                <div className="h-full bg-exito" style={{ width: `${progreso}%` }} />
              </div>
              <p className="mt-1 text-right text-xs font-semibold text-exito">{progreso} %</p>
            </div>
          </div>

          <Card titulo="Resumen de costos">
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between text-texto-700">
                <span>Tarifa {envio.servicio.nombre.toLowerCase()}</span>
                <span>{formatoMoneda(envio.subtotal)}</span>
              </li>
              <li className="flex justify-between text-texto-700">
                <span>Seguro (1 %)</span>
                <span>{formatoMoneda(envio.seguro)}</span>
              </li>
              <li className="flex justify-between text-texto-700">
                <span>IVA (19 %)</span>
                <span>{formatoMoneda(envio.iva)}</span>
              </li>
            </ul>
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
              <span className="text-sm font-semibold text-texto-900">Total cobrado</span>
              <span className="text-lg font-bold text-marca">{formatoMoneda(envio.total)}</span>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function Dato({ label, valor }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider text-texto-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-texto-900">{valor}</p>
    </div>
  );
}

function BotonRed({ icon: Icono, label }) {
  return (
    <button className="flex flex-col items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white py-2 text-texto-700 hover:bg-slate-50">
      <Icono size={14} />
      <span className="text-[11px] font-medium">{label}</span>
    </button>
  );
}
