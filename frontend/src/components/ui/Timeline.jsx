import { Check, Circle } from "lucide-react";

import { formatoFechaCorta, haceCuanto } from "../../i18n/format.js";

export default function Timeline({ historial }) {
  if (!historial?.length) {
    return <p className="text-sm text-texto-500">Aún no hay eventos registrados.</p>;
  }

  const total = historial.length;
  const ultimo = total - 1;

  return (
    <ol className="space-y-4">
      {historial.map((evt, idx) => {
        const completado = idx < ultimo;
        const actual = idx === ultimo;
        return (
          <li key={`${evt.fecha}-${idx}`} className="relative flex gap-4">
            <div className="flex flex-col items-center">
              <span
                className={[
                  "grid h-7 w-7 place-items-center rounded-full ring-4 ring-white",
                  completado && "bg-exito text-white",
                  actual && "bg-marca text-white",
                ]
                  .filter(Boolean)
                  .join(" ") || "bg-slate-200 text-texto-500"}
              >
                {completado ? <Check size={14} /> : <Circle size={10} fill="currentColor" />}
              </span>
              {idx < total - 1 && <span className="mt-1 w-0.5 flex-1 bg-emerald-100" />}
            </div>
            <div
              className={`flex-1 rounded-lg ${actual ? "bg-marca-claro/60 px-4 py-3" : "py-1"}`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className={`text-sm font-semibold ${actual ? "text-marca" : "text-texto-900"}`}>
                  {evt.estado.nombre}
                  {actual && (
                    <span className="ml-2 rounded-full bg-marca px-2 py-0.5 text-[10px] font-semibold uppercase text-white">
                      Paso actual
                    </span>
                  )}
                </p>
                <span className="text-xs text-texto-500">{formatoFechaCorta(evt.fecha)}</span>
              </div>
              {evt.ubicacion && (
                <p className="mt-0.5 text-xs text-texto-500">{evt.ubicacion}</p>
              )}
              {evt.descripcion && (
                <p className="mt-1 text-sm text-texto-700">{evt.descripcion}</p>
              )}
              {actual && <p className="mt-1 text-[11px] text-texto-400">Última actualización {haceCuanto(evt.fecha)}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
