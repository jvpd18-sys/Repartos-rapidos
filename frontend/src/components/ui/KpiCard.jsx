import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { formatoNumero } from "../../i18n/format.js";

const PALETA = {
  azul: { fondo: "#DBEAFE", icono: "#2563EB" },
  ambar: { fondo: "#FEF3C7", icono: "#F59E0B" },
  verde: { fondo: "#DCFCE7", icono: "#16A34A" },
  rojo: { fondo: "#FEE2E2", icono: "#DC2626" },
};

export default function KpiCard({ titulo, valor, delta, sentido, color = "azul", icono: Icono }) {
  const tonos = PALETA[color] || PALETA.azul;
  const Flecha = sentido === "down" ? ArrowDownRight : ArrowUpRight;
  const sentidoNeg = sentido === "down" || delta < 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-suave">
      <div className="mb-4 flex items-center justify-between">
        {Icono && (
          <span
            className="grid h-9 w-9 place-items-center rounded-lg"
            style={{ backgroundColor: tonos.fondo, color: tonos.icono }}
          >
            <Icono size={18} />
          </span>
        )}
        <span
          className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
            sentidoNeg ? "bg-red-50 text-critico" : "bg-emerald-50 text-exito"
          }`}
        >
          <Flecha size={12} />
          {sentidoNeg ? "" : "+"}
          {Math.round(delta)}%
        </span>
      </div>
      <p className="text-3xl font-bold text-texto-900">{formatoNumero(valor)}</p>
      <p className="mt-1 text-sm text-texto-500">{titulo}</p>
    </div>
  );
}
