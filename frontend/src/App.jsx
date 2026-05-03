import { Navigate, Route, Routes } from "react-router-dom";

import { useAuth } from "./auth/AuthContext.jsx";
import LayoutAdmin from "./components/layout/LayoutAdmin.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import EnvioConfirmacion from "./pages/EnvioConfirmacion.jsx";
import EnvioDetalle from "./pages/EnvioDetalle.jsx";
import EnvioNuevo from "./pages/EnvioNuevo.jsx";
import EnviosList from "./pages/EnviosList.jsx";
import Login from "./pages/Login.jsx";
import Rastreo from "./pages/public/Rastreo.jsx";

function RutaPrivada({ children }) {
  const { token, cargando } = useAuth();
  if (cargando) return <div className="grid h-full place-items-center text-texto-500">Cargando…</div>;
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function RutaPublicaSiInvitado({ children }) {
  const { token } = useAuth();
  if (token) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<RutaPublicaSiInvitado><Login /></RutaPublicaSiInvitado>} />
      <Route path="/rastrear" element={<Rastreo />} />

      <Route
        element={
          <RutaPrivada>
            <LayoutAdmin />
          </RutaPrivada>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/envios" element={<EnviosList />} />
        <Route path="/envios/nuevo" element={<EnvioNuevo />} />
        <Route path="/envios/:id" element={<EnvioDetalle />} />
        <Route path="/envios/:id/confirmacion" element={<EnvioConfirmacion />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
