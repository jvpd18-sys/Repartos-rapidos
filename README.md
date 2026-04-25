# Repartos Rápidos S.A.S — Plataforma de Gestión y Rastreo

Plataforma web para la empresa de mensajería "Repartos Rápidos S.A.S" que reemplaza el flujo manual de pedidos (cuaderno + WhatsApp + Excel) por un sistema centralizado con panel administrativo y página pública de rastreo.

Implementación de la **Fase 2** (codificación) basada en los mockups de la Fase 1 (`swiftship.pen`) y los requerimientos descritos en `Actividad FASE 1 ingeniería web.docx` y `AC_ Plataforma de Gestión y Rastreo.docx`.

## Tecnologías

- **Backend:** Python 3.13 · FastAPI · SQLAlchemy · SQLite · JWT (JOSE) · qrcode · python-barcode · Pillow
- **Frontend:** React 18 · Vite · Tailwind CSS · React Router · Axios · Recharts · Lucide · Day.js (`es`)
- **Base de datos:** SQLite embebido (`backend/repartos_rapidos.db`), normalizada en 3FN

## Estructura del proyecto

```
repartos-rapidos/
├── backend/                # FastAPI + SQLite
│   ├── app/
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── models.py       # Tablas 3FN
│   │   ├── schemas.py
│   │   ├── security.py     # JWT + bcrypt
│   │   ├── seed.py         # Datos demo
│   │   ├── utils/
│   │   │   ├── pricing.py
│   │   │   └── labels.py   # PNG con QR + código de barras
│   │   └── routers/
│   ├── requirements.txt
│   └── repartos_rapidos.db (se crea al primer arranque)
├── frontend/               # React + Vite + Tailwind
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── auth/
│   │   ├── api/
│   │   └── i18n/
│   └── package.json
├── start.bat               # Lanza ambos servicios
└── README.md
```

## Cómo correr la aplicación

### Opción 1 — usar `start.bat` (recomendado en Windows)

Doble click en `start.bat`. Se abrirán dos ventanas (backend y frontend) y el navegador en `http://localhost:5173`.

### Opción 2 — manual

**Backend:**
```bat
cd backend
py -m pip install -r requirements.txt
py -m uvicorn app.main:app --reload --port 8000
```

**Frontend (otra terminal):**
```bat
cd frontend
npm install
npm run dev
```

## URLs

- Panel administrativo: http://localhost:5173
- Página pública de rastreo: http://localhost:5173/rastrear
- API: http://localhost:8000
- Documentación interactiva (Swagger): http://localhost:8000/docs

## Credenciales demo

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | `admin@repartosrapidos.co` | `Reparto2026!` |
| Operador | `mariana.restrepo@repartosrapidos.co` | `Reparto2026!` |

## Endpoints principales (REST)

| Método | Ruta | Auth | Propósito |
|---|---|---|---|
| POST | `/api/auth/login` | – | Inicia sesión y devuelve JWT |
| POST | `/api/auth/register` | – | Crea una cuenta de operador |
| GET  | `/api/auth/me` | JWT | Devuelve el usuario autenticado |
| GET  | `/api/paquetes` | JWT | Lista de envíos (con filtros) |
| POST | `/api/paquetes` | JWT | Crea un envío |
| GET  | `/api/paquetes/{id}` | JWT | Detalle del envío |
| PUT  | `/api/paquetes/{id}` | JWT | Actualiza estado o repartidor |
| POST | `/api/paquetes/{id}/cancelar` | JWT | Cancela el envío |
| GET  | `/api/paquetes/{id}/etiqueta` | JWT | PNG con QR y código de barras |
| GET  | `/api/repartidores` | JWT | Lista de repartidores |
| GET  | `/api/repartidores/ubicaciones` | JWT | Coordenadas de la flota |
| GET  | `/api/dashboard/resumen` | JWT | KPIs, gráficos, recientes y alertas |
| GET  | `/api/track/{guia}` | – | Rastreo público |

## Funcionalidades por pantalla

1. **Inicio de sesión / Registro** — Conmutador, validación, "mantener sesión iniciada", JWT.
2. **Tablero operacional** — 4 KPIs, gráfico de envíos por día, distribución por estado, envíos recientes y panel de alertas.
3. **Listado de envíos** — Búsqueda por guía o cliente.
4. **Crear nuevo envío** — Wizard de 3 pasos, cálculo automático de subtotal, seguro (1 %), IVA (19 %) y total. Generación automática de la guía `ENV-AAAA-NNNNN`.
5. **Confirmación** — Resumen del envío y etiqueta imprimible (PNG con QR + código de barras).
6. **Detalle del envío** — Línea de tiempo del historial, repartidor asignado, costos. Acciones: imprimir etiqueta, reasignar, cancelar.
7. **Rastreo público** — Sin sesión, consulta por número de guía. Pruebas con `ENV-2026-00142` y `ENV-2026-00141`.

## Modelo de datos (3FN)

```
ciudades(id, nombre, departamento)
tipos_paquete(id, codigo, nombre)
servicios(id, codigo, nombre, dias_min, dias_max, tarifa_base)
estados_envio(id, codigo, nombre, color)
usuarios(id, nombre, email, password_hash, rol, activo, creado_en)
clientes(id, nombre, telefono, email, creado_en)
direcciones(id, cliente_id → clientes, ciudad_id → ciudades, direccion)
repartidores(id, nombre, telefono, vehiculo, estado, lat, lng)
envios(id, numero_guia, remitente_*, destinatario_*, servicio_id, tipo_paquete_id,
       peso_kg, dimensiones_cm, valor_declarado, subtotal, seguro, iva, total,
       estado_id, repartidor_id, fecha_creacion, fecha_estimada, creado_por_usuario_id)
envio_historial(id, envio_id → envios, estado_id → estados_envio, ubicacion,
                descripcion, fecha, registrado_por_usuario_id)
alertas(id, envio_id, tipo, mensaje, fecha, leida)
```

## Cálculo de costos

```
subtotal = servicios.tarifa_base
seguro   = round(valor_declarado × 0,01)
iva      = round(subtotal × 0,19)
total    = subtotal + seguro + iva
```

## Equipo

- Santiago Colmenares
- Luilly Perea
- David Pinzón
- Jésika Pachón

Universidad Manuela Beltrán · Facultad de Ingeniería · Ingeniería de Software · Bogotá D.C., 2026.
