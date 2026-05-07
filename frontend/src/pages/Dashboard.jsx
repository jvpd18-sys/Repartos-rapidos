import { AlertTriangle, ArrowRight, CheckCircle2, ChevronDown, Clock, Filter, Package } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

import { api } from "../api/client.js";
import Badge from "../components/ui/Badge.jsx";
import Card from "../components/ui/Card.jsx";
import KpiCard from "../components/ui/KpiCard.jsx";
import { formatoFechaCorta, haceCuanto } from "../i18n/format.js";

const ICONOS_KPI = { azul: Package, ambar: Clock, verde: CheckCircle2, rojo: AlertTriangle };

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/dashboard/resumen")
      .then((r) => setData(r.data))
      .catch(() => setError("No pudimos cargar el tablero. Intenta más tarde."));
  }, []);

  if (error) return <p className="text-sm text-critico">{error}</p>;
  if (!data) return <p className="text-sm text-texto-500">Cargando tablero…</p>;

  const maxValor = Math.max(...data.serie_dias.map((p) => p.valor), 1);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-texto-900">Tablero operacional</h1>
      </header>

      <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {data.kpis.map((k) => (
          <KpiCard
            key={k.titulo}
            titulo={k.titulo}
            valor={k.valor}
            delta={k.delta}
            sentido={k.sentido}
            color={k.color}
            icono={ICONOS_KPI[k.color] || Package}
          />
        ))}
      </section>

      <section className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card
          titulo="Envíos por día"
          className="lg:col-span-2"
          accion={
            <button className="flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-xs font-medium text-texto-700">
              Últimos 7 días <ChevronDown size={12} />
            </button>
          }
        >
          <p className="-mt-3 mb-3 text-xs text-texto-500">Últimos 7 días</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.serie_dias} barCategoryGap={20}>
                <XAxis dataKey="etiqueta" tickLine={false} axisLine={false} stroke="#94A3B8" fontSize={12} />
                <YAxis hide domain={[0, maxValor * 1.2]} />
                <Bar dataKey="valor" radius={[6, 6, 0, 0]}>
                  {data.serie_dias.map((entry, idx) => {
                    const esUltimo = idx === data.serie_dias.length - 1;
                    return (
                      <Cell key={idx} fill={esUltimo ? "#2563EB" : "#DBEAFE"} />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card titulo="Estado de envíos">
          <p className="-mt-3 mb-3 text-xs text-texto-500">Distribución actual</p>
          <div className="relative h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.distribucion}
                  dataKey="cantidad"
                  innerRadius={56}
                  outerRadius={78}
                  paddingAngle={2}
                  stroke="none"
                >
                  {data.distribucion.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 grid place-items-center">
              <div className="text-center">
                <p className="text-2xl font-bold text-texto-900">{data.distribucion_total}</p>
                <p className="text-[11px] uppercase tracking-wider text-texto-400">Total</p>
              </div>
            </div>
          </div>
          <ul className="mt-4 space-y-2 text-sm">
            {data.distribucion.map((d) => (
              <li key={d.estado} className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-texto-700">{d.estado}</span>
                </span>
                <span className="text-xs text-texto-500">
                  <span className="font-semibold text-texto-900">{d.cantidad}</span> · {d.porcentaje}%
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card
          titulo="Envíos recientes"
          className="lg:col-span-2"
          accion={
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-xs font-medium text-texto-700">
                <Filter size={12} /> Filtrar
              </button>
              <Link
                to="/envios"
                className="flex items-center gap-1 text-xs font-semibold text-marca hover:underline"
              >
                Ver todos <ArrowRight size={12} />
              </Link>
            </div>
          }
        >
          <p className="-mt-3 mb-3 text-xs text-texto-500">Actualizado hace 2 minutos</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-[11px] uppercase tracking-wider text-texto-400">
                <tr>
                  <th className="py-2">Guía</th>
                  <th>Cliente</th>
                  <th>Destino</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {data.recientes.map((r) => (
                  <tr key={r.id} className="border-t border-slate-100">
                    <td className="py-3">
                      <Link to={`/envios/${r.id}`} className="font-semibold text-marca hover:underline">
                        {r.numero_guia}
                      </Link>
                    </td>
                    <td className="text-texto-700">{r.cliente_destinatario}</td>
                    <td className="text-texto-700">{r.ciudad_destino}</td>
                    <td>
                      <Badge color={r.estado.color}>{r.estado.nombre}</Badge>
                    </td>
                    <td className="text-texto-500">{formatoFechaCorta(r.fecha_creacion)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card titulo="Alertas" icono={AlertTriangle} iconoColor="#DC2626" accion={<Badge color="#DC2626">{data.alertas.length}</Badge>}>
          <ul className="space-y-3">
            {data.alertas.map((a) => (
              <li key={a.id} className="flex gap-3">
                <span
                  className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                    a.tipo === "retraso" ? "bg-critico" : a.tipo === "stock" ? "bg-atencion" : "bg-marca"
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-snug text-texto-700">{a.mensaje}</p>
                  <p className="mt-0.5 text-[11px] text-texto-400">{haceCuanto(a.fecha)}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-4 border-t border-slate-100 pt-3 text-center">
            <a className="text-xs font-semibold text-marca hover:underline" href="#alertas">
              Ver todas las alertas →
            </a>
          </div>
        </Card>
      </section>
    </div>
  );
}
