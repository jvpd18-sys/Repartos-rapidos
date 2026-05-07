import { Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { api } from "../api/client.js";
import Badge from "../components/ui/Badge.jsx";
import Card from "../components/ui/Card.jsx";
import { formatoFechaCorta, formatoMoneda } from "../i18n/format.js";

export default function EnviosList() {
  const [envios, setEnvios] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    setCargando(true);
    api
      .get("/paquetes", { params: { busqueda: busqueda || undefined } })
      .then((r) => setEnvios(r.data))
      .finally(() => setCargando(false));
  }, [busqueda]);

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-texto-400">Envíos</p>
          <h1 className="text-2xl font-bold text-texto-900">Listado de envíos</h1>
        </div>
        <Link
          to="/envios/nuevo"
          className="flex items-center gap-2 rounded-lg bg-marca px-4 py-2 text-sm font-semibold text-white shadow-marca hover:bg-marca-oscuro"
        >
          <Plus size={16} /> Nuevo envío
        </Link>
      </header>

      <Card>
        <div className="mb-4 flex items-center gap-3">
          <div className="relative w-72 max-w-full">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-texto-400" />
            <input
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por guía o cliente…"
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-marca focus:outline-none focus:ring-1 focus:ring-marca"
            />
          </div>
          <p className="text-xs text-texto-500">{envios.length} envíos encontrados</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-[11px] uppercase tracking-wider text-texto-400">
              <tr>
                <th className="py-2">Guía</th>
                <th>Cliente</th>
                <th>Destino</th>
                <th>Estado</th>
                <th>Total</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr><td colSpan="6" className="py-6 text-center text-texto-500">Cargando…</td></tr>
              ) : envios.length === 0 ? (
                <tr><td colSpan="6" className="py-6 text-center text-texto-500">Aún no hay envíos registrados.</td></tr>
              ) : (
                envios.map((e) => (
                  <tr key={e.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="py-3">
                      <Link to={`/envios/${e.id}`} className="font-semibold text-marca hover:underline">
                        {e.numero_guia}
                      </Link>
                    </td>
                    <td className="text-texto-700">{e.cliente_destinatario}</td>
                    <td className="text-texto-700">{e.ciudad_destino}</td>
                    <td><Badge color={e.estado.color}>{e.estado.nombre}</Badge></td>
                    <td className="font-semibold text-texto-900">{formatoMoneda(e.total)}</td>
                    <td className="text-texto-500">{formatoFechaCorta(e.fecha_creacion)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
