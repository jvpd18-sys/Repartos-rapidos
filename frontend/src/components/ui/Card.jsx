export default function Card({ children, className = "", titulo, accion, icono: Icono, iconoColor = "#2563EB" }) {
  return (
    <section className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-suave ${className}`}>
      {(titulo || accion || Icono) && (
        <header className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {Icono && (
              <span
                className="grid h-8 w-8 place-items-center rounded-lg"
                style={{ backgroundColor: `${iconoColor}1A`, color: iconoColor }}
              >
                <Icono size={16} />
              </span>
            )}
            {titulo && <h3 className="text-base font-semibold text-texto-900">{titulo}</h3>}
          </div>
          {accion}
        </header>
      )}
      {children}
    </section>
  );
}
