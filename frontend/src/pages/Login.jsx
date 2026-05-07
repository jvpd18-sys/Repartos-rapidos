import { Eye, EyeOff, KeyRound, Mail, Package } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../auth/AuthContext.jsx";

export default function Login() {
  const { iniciarSesion, registrar } = useAuth();
  const nav = useNavigate();

  const [modo, setModo] = useState("login");
  const [email, setEmail] = useState("admin@repartosrapidos.co");
  const [password, setPassword] = useState("Reparto2026!");
  const [nombre, setNombre] = useState("");
  const [recordar, setRecordar] = useState(true);
  const [mostrar, setMostrar] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const enviar = async (e) => {
    e.preventDefault();
    setError("");
    setCargando(true);
    try {
      if (modo === "login") {
        await iniciarSesion(email, password, recordar);
      } else {
        if (!nombre.trim()) throw new Error("Ingresa tu nombre completo.");
        if (password.length < 8) throw new Error("La contraseña debe tener al menos 8 caracteres.");
        await registrar(nombre, email, password);
      }
      nav("/", { replace: true });
    } catch (err) {
      const detalle = err?.response?.data?.detail || err?.message || "No pudimos procesar tu solicitud.";
      setError(detalle);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <aside className="relative hidden flex-col justify-between bg-panel p-10 text-white lg:flex">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-marca">
            <Package size={20} />
          </span>
          <div>
            <p className="text-base font-bold">Repartos Rápidos</p>
            <p className="text-[10px] uppercase tracking-wider text-texto-400">S.A.S</p>
          </div>
        </div>

        <div className="space-y-5 max-w-md">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-marca" /> Plataforma para operadores logísticos
          </span>
          <h1 className="text-4xl font-bold leading-tight">
            Gestiona miles de envíos<br /> desde un solo panel.
          </h1>
          <p className="text-sm text-slate-300">
            Crea guías, monitorea rutas y resuelve incidencias en tiempo real con Repartos Rápidos.
          </p>
        </div>

        <blockquote className="max-w-md rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm leading-relaxed text-slate-200">
            «Redujimos en 40 % las incidencias de entrega y duplicamos la capacidad operativa en 3 meses».
          </p>
          <footer className="mt-3 flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-marca text-xs font-bold">MR</span>
            <div>
              <p className="text-xs font-semibold">Mariana Restrepo</p>
              <p className="text-[11px] text-slate-400">Ops Manager · Distribuidora LogiCol</p>
            </div>
          </footer>
        </blockquote>
      </aside>

      <section className="grid place-items-center bg-white p-8">
        <form onSubmit={enviar} className="w-full max-w-sm space-y-5">
          <div>
            <h2 className="text-2xl font-bold text-texto-900">
              {modo === "login" ? "Bienvenido de vuelta" : "Crea tu cuenta"}
            </h2>
            <p className="mt-1 text-sm text-texto-500">
              {modo === "login"
                ? "Ingresa con tu cuenta corporativa para acceder al panel operativo."
                : "Crea una cuenta para gestionar envíos en Repartos Rápidos."}
            </p>
          </div>

          <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1 text-sm font-medium">
            <button
              type="button"
              onClick={() => setModo("login")}
              className={`rounded-lg py-2 transition ${
                modo === "login" ? "bg-white text-texto-900 shadow-suave" : "text-texto-500"
              }`}
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              onClick={() => setModo("registro")}
              className={`rounded-lg py-2 transition ${
                modo === "registro" ? "bg-white text-texto-900 shadow-suave" : "text-texto-500"
              }`}
            >
              Crear cuenta
            </button>
          </div>

          {modo === "registro" && (
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-texto-900">Nombre completo</span>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ana Martínez"
                required
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-marca focus:outline-none focus:ring-1 focus:ring-marca"
              />
            </label>
          )}

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-texto-900">Correo corporativo</span>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-texto-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm focus:border-marca focus:outline-none focus:ring-1 focus:ring-marca"
              />
            </div>
          </label>

          <label className="block">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-sm font-medium text-texto-900">Contraseña</span>
              {modo === "login" && (
                <a className="text-xs font-medium text-marca" href="#olvide">
                  ¿Olvidaste tu contraseña?
                </a>
              )}
            </div>
            <div className="relative">
              <KeyRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-texto-400" />
              <input
                type={mostrar ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-10 text-sm focus:border-marca focus:outline-none focus:ring-1 focus:ring-marca"
              />
              <button
                type="button"
                aria-label={mostrar ? "Ocultar contraseña" : "Mostrar contraseña"}
                onClick={() => setMostrar((m) => !m)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-texto-400 hover:text-texto-700"
              >
                {mostrar ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>

          {modo === "login" && (
            <label className="flex items-center gap-2 text-sm text-texto-700">
              <input
                type="checkbox"
                checked={recordar}
                onChange={(e) => setRecordar(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-marca focus:ring-marca"
              />
              Mantener sesión iniciada por 30 días
            </label>
          )}

          {error && (
            <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-critico">{error}</p>
          )}

          <button
            disabled={cargando}
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-marca px-4 py-3 text-sm font-semibold text-white shadow-marca transition hover:bg-marca-oscuro disabled:opacity-60"
          >
            {cargando ? "Enviando…" : modo === "login" ? "Ingresar al panel →" : "Crear cuenta →"}
          </button>

          <div className="relative my-4 text-center">
            <span className="bg-white px-3 text-xs text-texto-400">o continuar con</span>
            <span className="absolute inset-x-0 top-1/2 -z-10 h-px bg-slate-200" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled
              className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white py-2 text-sm font-medium text-texto-700 disabled:cursor-not-allowed disabled:opacity-60"
              title="Disponible próximamente"
            >
              <span className="text-base">Ⓖ</span> Google
            </button>
            <button
              type="button"
              disabled
              className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white py-2 text-sm font-medium text-texto-700 disabled:cursor-not-allowed disabled:opacity-60"
              title="Disponible próximamente"
            >
              <span className="text-base">▦</span> Microsoft
            </button>
          </div>

          <p className="pt-2 text-center text-xs text-texto-500">
            ¿Primera vez en Repartos Rápidos?{" "}
            <button
              type="button"
              onClick={() => setModo("registro")}
              className="font-semibold text-marca"
            >
              Crea tu cuenta
            </button>
          </p>
        </form>
      </section>
    </div>
  );
}
