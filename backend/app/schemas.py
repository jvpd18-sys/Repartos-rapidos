from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr, ConfigDict


class LoginIn(BaseModel):
    email: EmailStr
    password: str
    recordar: bool = False


class RegistroIn(BaseModel):
    nombre: str
    email: EmailStr
    password: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    usuario: dict


class UsuarioOut(BaseModel):
    id: int
    nombre: str
    email: EmailStr
    rol: str
    model_config = ConfigDict(from_attributes=True)


class CiudadOut(BaseModel):
    id: int
    nombre: str
    departamento: str
    model_config = ConfigDict(from_attributes=True)


class TipoPaqueteOut(BaseModel):
    id: int
    codigo: str
    nombre: str
    model_config = ConfigDict(from_attributes=True)


class ServicioOut(BaseModel):
    id: int
    codigo: str
    nombre: str
    dias_min: int
    dias_max: int
    tarifa_base: int
    model_config = ConfigDict(from_attributes=True)


class EstadoOut(BaseModel):
    id: int
    codigo: str
    nombre: str
    color: str
    model_config = ConfigDict(from_attributes=True)


class RepartidorOut(BaseModel):
    id: int
    nombre: str
    telefono: str
    vehiculo: str
    estado: str
    lat: Optional[float]
    lng: Optional[float]
    actualizado_en: datetime
    model_config = ConfigDict(from_attributes=True)


class UbicacionRepartidor(BaseModel):
    id: int
    nombre: str
    vehiculo: str
    estado: str
    lat: Optional[float]
    lng: Optional[float]


class PersonaIn(BaseModel):
    nombre: str
    telefono: str
    direccion: str
    ciudad_id: int


class PaqueteIn(BaseModel):
    peso_kg: float
    dimensiones_cm: str
    tipo_paquete_id: int
    valor_declarado: int


class EnvioIn(BaseModel):
    remitente: PersonaIn
    destinatario: PersonaIn
    paquete: PaqueteIn
    servicio_id: int
    notas_entrega: Optional[str] = None


class EnvioListItem(BaseModel):
    id: int
    numero_guia: str
    cliente_destinatario: str
    ciudad_destino: str
    estado: EstadoOut
    fecha_creacion: datetime
    total: int


class HistorialItem(BaseModel):
    estado: EstadoOut
    ubicacion: Optional[str]
    descripcion: Optional[str]
    fecha: datetime


class PersonaOut(BaseModel):
    nombre: str
    telefono: str
    direccion: str
    ciudad: str
    departamento: str


class EnvioDetalle(BaseModel):
    id: int
    numero_guia: str
    estado: EstadoOut
    servicio: ServicioOut
    tipo_paquete: TipoPaqueteOut
    peso_kg: float
    dimensiones_cm: str
    valor_declarado: int
    notas_entrega: Optional[str]
    subtotal: int
    seguro: int
    iva: int
    total: int
    fecha_creacion: datetime
    fecha_estimada: datetime
    remitente: PersonaOut
    destinatario: PersonaOut
    repartidor: Optional[RepartidorOut]
    historial: List[HistorialItem]


class EnvioActualizarIn(BaseModel):
    estado_codigo: Optional[str] = None
    repartidor_id: Optional[int] = None
    descripcion: Optional[str] = None
    ubicacion: Optional[str] = None


class TrackingOut(BaseModel):
    numero_guia: str
    estado: EstadoOut
    origen_ciudad: str
    origen_departamento: str
    destino_ciudad: str
    destino_departamento: str
    destinatario: str
    direccion_destino: str
    fecha_estimada: datetime
    historial: List[HistorialItem]


class KpiCard(BaseModel):
    titulo: str
    valor: int
    delta: float
    sentido: str
    color: str


class PuntoSerie(BaseModel):
    etiqueta: str
    valor: int


class DistribucionItem(BaseModel):
    estado: str
    color: str
    cantidad: int
    porcentaje: float


class AlertaOut(BaseModel):
    id: int
    tipo: str
    mensaje: str
    fecha: datetime
    envio_guia: Optional[str]


class DashboardOut(BaseModel):
    fecha: datetime
    kpis: List[KpiCard]
    serie_dias: List[PuntoSerie]
    distribucion: List[DistribucionItem]
    distribucion_total: int
    recientes: List[EnvioListItem]
    alertas: List[AlertaOut]


class ClienteIn(BaseModel):
    nombre: str
    telefono: str
    email: Optional[EmailStr] = None


class ClienteOut(BaseModel):
    id: int
    nombre: str
    telefono: str
    email: Optional[str]
    model_config = ConfigDict(from_attributes=True)
