import { Bell, Plus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../auth/AuthContext.jsx";
import { formatoFechaLarga } from "../../i18n/format.js";

export default function Topbar() {
  const nav = useNavigate();
  const { usuario } = useAuth();

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-8 py-4">
      <p className="text-xs font-medium text-texto-500">{formatoFechaLarga(new Date())}</p>
      <div className="flex flex-1 items-center justify-end gap-3">
        <div className="relative w-72 max-w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-texto-400" />
          <input
            type="search"
            placeholder="Buscar guía, cliente…"
            className="w-full rounded-lg border border-slate-200 bg-fondo py-2 pl-9 pr-3 text-sm placeholder-texto-400 focus:border-marca focus:outline-none focus:ring-1 focus:ring-marca"
          />
        </div>
        <button
          className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-texto-700 hover:bg-slate-50"
          title="Notificaciones"
        >
          <Bell size={16} />
        </button>
        <span
          className="grid h-9 w-9 place-items-center rounded-full bg-marca-claro text-xs font-bold text-marca"
          title={usuario?.nombre}
        >
          {(usuario?.nombre || "?")
            .split(" ")
            .slice(0, 2)
            .map((p) => p[0])
            .join("")}
        </span>
        <button
          onClick={() => nav("/envios/nuevo")}
          className="flex items-center gap-2 rounded-lg bg-texto-900 px-4 py-2 text-sm font-semibold text-white shadow-suave hover:bg-black"
        >
          <Plus size={16} /> Nuevo envío
        </button>
      </div>
    </header>
  );
}
