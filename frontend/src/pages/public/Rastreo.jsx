import { Bell, ChevronDown, HelpCircle, MessageCircle, Package, Search, Share2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { api } from "../../api/client.js";
import Badge from "../../components/ui/Badge.jsx";
import Card from "../../components/ui/Card.jsx";
import Timeline from "../../components/ui/Timeline.jsx";
import { formatoFechaLarga, formatoVentana } from "../../i18n/format.js";

const EJEMPLOS = ["ENV-2026-00142", "ENV-2026-00141"];

export default function Rastreo() {
  const [guia, setGuia] = useState("");
  const [tracking, setTracking] = useState(null);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const buscar = async (texto) => {
    const valor = (texto ?? guia).trim().toUpperCase();
    if (!valor) {
      setError("Ingresa un número de guía válido.");
      return;
    }
    setError("");
    setCargando(true);
    setTracking(null);
    try {
      const resp = await api.get(`/track/${encodeURIComponent(valor)}`);
      setTracking(resp.data);
      setGuia(valor);
    } catch (err) {
      setError(err?.response?.data?.detail || "No encontramos la guía ingresada. Verifica el número e inténtalo de nuevo.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-fondo">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/rastrear" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-marca text-white">
              <Package size={16} />
            </span>
            <span className="text-base font-bold text-texto-900">Repartos Rápidos</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-texto-700 md:flex">
            <a href="#rastrear" className="font-semibold text-marca">Rastrear</a>
            <a href="#servicios">Servicios</a>
            <a href="#cotizar">Cotizar</a>
            <a href="#contacto">Contacto</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-texto-700 hover:bg-slate-50"
            >
              Iniciar sesión
            </Link>
            <Link
              to="/login"
              className="rounded-lg bg-marca px-3 py-1.5 text-sm font-semibold text-white hover:bg-marca-oscuro"
            >
              Crear cuenta
            </Link>
          </div>
        </div>
      </header>

      <section className="bg-white pb-12 pt-12">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-marca-claro px-3 py-1 text-xs font-semibold text-marca">
            <span className="h-1.5 w-1.5 rounded-full bg-marca" /> Seguimiento en tiempo real
          </span>
          <h1 className="mt-5 text-4xl font-bold text-texto-900 md:text-5xl">Rastrea tu envío</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-texto-500">
            Ingresa tu número de guía para ver el estado actual, la ubicación y la fecha estimada de entrega de tu paquete.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              buscar();
            }}
            className="mx-auto mt-8 flex max-w-2xl items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-suave"
          >
            <Search size={18} className="ml-3 text-texto-400" />
            <input
              type="text"
              value={guia}
              onChange={(e) => setGuia(e.target.value)}
              placeholder="ENV-2026-00142"
              className="flex-1 bg-transparent px-2 py-2 text-sm focus:outline-none"
            />
            <button
              type="submit"
              disabled={cargando}
              className="flex items-center gap-2 rounded-xl bg-marca px-5 py-2.5 text-sm font-semibold text-white shadow-marca hover:bg-marca-oscuro disabled:opacity-60"
            >
              {cargando ? "Buscando…" : "Rastrear →"}
            </button>
          </form>
          <p className="mt-3 text-xs text-texto-400">
            Prueba con:{" "}
            {EJEMPLOS.map((g, i) => (
              <span key={g}>
                <button
                  className="font-semibold text-marca hover:underline"
                  onClick={() => buscar(g)}
                >
                  {g}
                </button>
                {i < EJEMPLOS.length - 1 && " · "}
              </span>
            ))}
          </p>

          {error && (
            <p className="mx-auto mt-5 max-w-xl rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-critico">
              {error}
            </p>
          )}
        </div>
      </section>

      {tracking && (
        <section className="mx-auto max-w-4xl px-6 pb-10">
          <Card>
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-texto-400">
                  Número de guía
                </p>
                <h2 className="text-2xl font-bold text-texto-900">{tracking.numero_guia}</h2>
              </div>
              <Badge color={tracking.estado.color}>{tracking.estado.nombre}</Badge>
            </div>

            <div className="grid grid-cols-1 gap-4 border-y border-slate-100 py-5 md:grid-cols-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-texto-400">Origen</p>
                <p className="mt-1 text-sm font-semibold text-texto-900">{tracking.origen_ciudad}</p>
                <p className="text-xs text-texto-500">{tracking.origen_departamento}</p>
              </div>
              <div className="md:border-x md:border-slate-100 md:px-5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-texto-400">Destino</p>
                <p className="mt-1 text-sm font-semibold text-texto-900">{tracking.destino_ciudad}</p>
                <p className="text-xs text-texto-500">
                  {tracking.destinatario} · {tracking.direccion_destino}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-texto-400">Entrega estimada</p>
                <p className="mt-1 text-sm font-semibold text-marca">{formatoFechaLarga(tracking.fecha_estimada)}</p>
                <p className="text-xs text-texto-500">{formatoVentana(tracking.fecha_estimada)}</p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between">
              <p className="text-sm font-semibold text-texto-900">Historial del envío</p>
              <button className="flex items-center gap-1 text-xs font-semibold text-marca hover:underline">
                <Share2 size={12} /> Compartir
              </button>
            </div>
            <p className="mt-1 text-xs text-texto-500">
              Progreso actual: {tracking.historial.length} de 5 pasos completados
            </p>

            <div className="mt-5">
              <Timeline historial={tracking.historial} />
            </div>
          </Card>
        </section>
      )}

      <section className="mx-auto grid max-w-4xl gap-4 px-6 pb-12 md:grid-cols-3">
        <CardSoporte
          icono={MessageCircle}
          titulo="¿Necesitas ayuda?"
          texto="Chatea con un agente 24/7 o llama al 01-8000-CHIP."
          enlace="Abrir chat →"
        />
        <CardSoporte
          icono={Bell}
          titulo="Notifícate al entregar"
          texto="Recibe en WhatsApp o correo cuando cambie el estado del envío."
          enlace="Activar notificaciones →"
        />
        <CardSoporte
          icono={HelpCircle}
          titulo="Preguntas frecuentes"
          texto="Consulta tiempos, coberturas y políticas de indemnización."
          enlace="Ir al centro de ayuda →"
        />
      </section>

      <footer className="bg-panel py-8 text-slate-300">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-marca text-white">
              <Package size={14} />
            </span>
            <p className="text-xs">© {new Date().getFullYear()} Repartos Rápidos S.A.S</p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <a>Términos</a>
            <a>Privacidad</a>
            <a>Cookies</a>
            <button className="flex items-center gap-1 rounded-md border border-white/10 px-2 py-1">
              Español (CO) <ChevronDown size={12} />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

function CardSoporte({ icono: Icono, titulo, texto, enlace }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-suave">
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-marca-claro text-marca">
        <Icono size={16} />
      </span>
      <p className="mt-3 text-sm font-semibold text-texto-900">{titulo}</p>
      <p className="mt-1 text-xs text-texto-500">{texto}</p>
      <a className="mt-2 inline-block text-xs font-semibold text-marca hover:underline" href="#enlace">
        {enlace}
      </a>
    </div>
  );
}
