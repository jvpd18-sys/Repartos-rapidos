export default function StepIndicator({ pasos, actual }) {
  return (
    <ol className="flex items-center gap-3">
      {pasos.map((paso, idx) => {
        const numero = idx + 1;
        const completado = numero < actual;
        const activo = numero === actual;
        return (
          <li key={paso} className="flex flex-1 items-center gap-3">
            <span
              className={[
                "grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold transition",
                completado && "bg-marca text-white",
                activo && "border-2 border-marca text-marca",
                !completado && !activo && "bg-slate-200 text-texto-500",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {numero}
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-texto-400">
                Paso {numero}
              </p>
              <p
                className={`truncate text-sm font-semibold ${
                  activo || completado ? "text-texto-900" : "text-texto-500"
                }`}
              >
                {paso}
              </p>
            </div>
            {idx < pasos.length - 1 && (
              <span
                className={`mx-2 hidden h-px flex-1 ${completado ? "bg-marca" : "bg-slate-200"} sm:block`}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
