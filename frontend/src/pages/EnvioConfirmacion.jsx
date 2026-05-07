import { CheckCircle2, Eye, Plus, Printer } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { api } from "../api/client.js";
import Card from "../components/ui/Card.jsx";
import { formatoFechaCorta, formatoMoneda, formatoPeso, formatoVentana } from "../i18n/format.js";

export default function EnvioConfirmacion() {
  const { id } = useParams();
  const [envio, setEnvio] = useState(null);
  const [etiquetaUrl, setEtiquetaUrl] = useState(null);

  useEffect(() => {
    api.get(`/paquetes/${id}`).then((r) => setEnvio(r.data));
  }, [id]);

  useEffect(() => {
    if (!envio) return;
    api
      .get(`/paquetes/${envio.id}/etiqueta`, { responseType: "blob" })
      .then((r) => setEtiquetaUrl(URL.createObjectURL(r.data)));
  }, [envio]);

  if (!envio) return <p className="text-sm text-texto-500">Cargando…</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center text-center">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-exito ring-8 ring-emerald-50">
          <CheckCircle2 size={28} />
        </span>
        <h1 className="mt-4 text-2xl font-bold text-texto-900">¡Envío creado con éxito!</h1>
        <p className="mt-1 text-sm text-texto-500">
          La guía <span className="font-semibold text-texto-900">{envio.numero_guia}</span> ya está lista. Imprime la
          etiqueta y pégala en el paquete.
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <a
            href={etiquetaUrl || "#"}
            download={`${envio.numero_guia}.png`}
            className="flex items-center gap-2 rounded-lg bg-marca px-4 py-2 text-sm font-semibold text-white shadow-marca hover:bg-marca-oscuro"
          >
            <Printer size={16} /> Imprimir etiqueta
          </a>
          <Link
            to={`/envios/${envio.id}`}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-texto-700 hover:bg-slate-50"
          >
            <Eye size={16} /> Ver detalle
          </Link>
          <Link
            to="/envios/nuevo"
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-texto-700 hover:bg-slate-50"
          >
            <Plus size={16} /> Crear otro envío
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card titulo="Resumen del envío">
          <div className="space-y-4 text-sm">
            <Bloque etiqueta="REMITENTE">
              <p className="font-semibold text-texto-900">
                {envio.remitente.nombre} <span className="font-normal text-texto-500">· {envio.remitente.telefono}</span>
              </p>
              <p className="text-texto-500">
                {envio.remitente.direccion} · {envio.remitente.ciudad}
              </p>
            </Bloque>
            <Bloque etiqueta="DESTINATARIO">
              <p className="font-semibold text-texto-900">
                {envio.destinatario.nombre}{" "}
                <span className="font-normal text-texto-500">· {envio.destinatario.telefono}</span>
              </p>
              <p className="text-texto-500">
                {envio.destinatario.direccion} · {envio.destinatario.ciudad}, {envio.destinatario.departamento}
              </p>
            </Bloque>
            <div className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-4">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-texto-400">Servicio</p>
                <p className="text-sm font-semibold text-texto-900">{envio.servicio.nombre}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-texto-400">Peso · dim.</p>
                <p className="text-sm font-semibold text-texto-900">
                  {formatoPeso(envio.peso_kg)} · {envio.tipo_paquete.nombre.toLowerCase()}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-texto-400">ETA</p>
                <p className="text-sm font-semibold text-exito">{formatoVentana(envio.fecha_estimada).split("·")[0]}</p>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <span className="text-sm font-semibold text-texto-900">Total cobrado</span>
              <span className="text-xl font-bold text-marca">{formatoMoneda(envio.total)}</span>
            </div>
            <p className="text-[11px] text-texto-400">Creado {formatoFechaCorta(envio.fecha_creacion)}</p>
          </div>
        </Card>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-suave">
          <div className="rounded-t-2xl bg-texto-900 px-5 py-4 text-white">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold">Repartos Rápidos S.A.S</p>
              <span className="rounded-md bg-atencion px-2 py-0.5 text-[10px] font-bold uppercase text-texto-900">
                {envio.servicio.nombre}
              </span>
            </div>
          </div>
          <div className="space-y-4 p-5">
            {etiquetaUrl ? (
              <img src={etiquetaUrl} alt={`Etiqueta ${envio.numero_guia}`} className="mx-auto w-full max-w-md" />
            ) : (
              <p className="text-center text-sm text-texto-500">Generando etiqueta…</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Bloque({ etiqueta, children }) {
  return (
    <div>
      <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-texto-400">{etiqueta}</p>
      {children}
    </div>
  );
}
