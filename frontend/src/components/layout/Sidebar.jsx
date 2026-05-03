import { BarChart3, LayoutDashboard, LogOut, Package, Settings, Truck, Users } from "lucide-react";
import { NavLink } from "react-router-dom";

import { useAuth } from "../../auth/AuthContext.jsx";

const items = [
  { to: "/", label: "Tablero", icon: LayoutDashboard, end: true },
  { to: "/envios", label: "Envíos", icon: Truck },
  { to: "/clientes", label: "Clientes", icon: Users, deshabilitado: true },
  { to: "/reportes", label: "Reportes", icon: BarChart3, deshabilitado: true },
  { to: "/ajustes", label: "Ajustes", icon: Settings, deshabilitado: true },
];

export default function Sidebar() {
  const { usuario, cerrarSesion } = useAuth();

  return (
    <aside className="hidden w-60 shrink-0 border-r border-slate-200 bg-white md:flex md:flex-col">
      <div className="flex items-center gap-2 px-6 py-6">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-marca text-white">
          <Package size={20} />
        </span>
        <div className="leading-tight">
          <p className="text-sm font-bold text-texto-900">Repartos Rápidos</p>
          <p className="text-[10px] font-medium uppercase tracking-wider text-texto-500">S.A.S</p>
        </div>
      </div>

      <p className="px-6 pb-2 pt-3 text-[10px] font-semibold uppercase tracking-wider text-texto-400">
        Menú principal
      </p>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {items.map((it) => {
          const Icono = it.icon;
          if (it.deshabilitado) {
            return (
              <span
                key={it.to}
                className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2 text-sm text-texto-400"
                title="Disponible próximamente"
              >
                <Icono size={18} />
                {it.label}
              </span>
            );
          }
          return (
            <NavLink
              key={it.to}
              to={it.to}
              end={it.end}
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                  isActive
                    ? "bg-marca-claro text-marca"
                    : "text-texto-700 hover:bg-slate-100",
                ].join(" ")
              }
            >
              <Icono size={18} />
              {it.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 px-4 py-4">
        <div className="mb-2 flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-marca text-xs font-bold text-white">
            {(usuario?.nombre || "?")
              .split(" ")
              .slice(0, 2)
              .map((p) => p[0])
              .join("")}
          </span>
          <div className="leading-tight">
            <p className="text-xs font-semibold text-texto-900">{usuario?.nombre}</p>
            <p className="text-[11px] capitalize text-texto-500">{usuario?.rol}</p>
          </div>
        </div>
        <button
          onClick={cerrarSesion}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-texto-700 hover:bg-slate-50"
        >
          <LogOut size={14} /> Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
