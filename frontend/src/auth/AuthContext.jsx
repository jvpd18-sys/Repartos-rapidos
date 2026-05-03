import { createContext, useContext, useEffect, useState } from "react";

import { api } from "../api/client.js";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("rr_token"));
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(Boolean(localStorage.getItem("rr_token")));

  useEffect(() => {
    if (!token) {
      setUsuario(null);
      setCargando(false);
      return;
    }
    setCargando(true);
    api
      .get("/auth/me")
      .then((r) => setUsuario(r.data))
      .catch(() => {
        localStorage.removeItem("rr_token");
        setToken(null);
      })
      .finally(() => setCargando(false));
  }, [token]);

  const iniciarSesion = async (email, password, recordar) => {
    const resp = await api.post("/auth/login", { email, password, recordar });
    localStorage.setItem("rr_token", resp.data.access_token);
    setToken(resp.data.access_token);
    setUsuario(resp.data.usuario);
    return resp.data.usuario;
  };

  const registrar = async (nombre, email, password) => {
    const resp = await api.post("/auth/register", { nombre, email, password });
    localStorage.setItem("rr_token", resp.data.access_token);
    setToken(resp.data.access_token);
    setUsuario(resp.data.usuario);
    return resp.data.usuario;
  };

  const cerrarSesion = () => {
    localStorage.removeItem("rr_token");
    setToken(null);
    setUsuario(null);
  };

  return (
    <AuthCtx.Provider value={{ token, usuario, cargando, iniciarSesion, registrar, cerrarSesion }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
