from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Text
)
from sqlalchemy.orm import relationship
from .database import Base


class Ciudad(Base):
    __tablename__ = "ciudades"
    id = Column(Integer, primary_key=True)
    nombre = Column(String(80), nullable=False)
    departamento = Column(String(80), nullable=False)


class TipoPaquete(Base):
    __tablename__ = "tipos_paquete"
    id = Column(Integer, primary_key=True)
    codigo = Column(String(20), unique=True, nullable=False)
    nombre = Column(String(40), nullable=False)


class Servicio(Base):
    __tablename__ = "servicios"
    id = Column(Integer, primary_key=True)
    codigo = Column(String(20), unique=True, nullable=False)
    nombre = Column(String(40), nullable=False)
    dias_min = Column(Integer, nullable=False)
    dias_max = Column(Integer, nullable=False)
    tarifa_base = Column(Integer, nullable=False)


class EstadoEnvio(Base):
    __tablename__ = "estados_envio"
    id = Column(Integer, primary_key=True)
    codigo = Column(String(30), unique=True, nullable=False)
    nombre = Column(String(40), nullable=False)
    color = Column(String(20), nullable=False)


class Usuario(Base):
    __tablename__ = "usuarios"
    id = Column(Integer, primary_key=True)
    nombre = Column(String(80), nullable=False)
    email = Column(String(120), unique=True, nullable=False, index=True)
    password_hash = Column(String(200), nullable=False)
    rol = Column(String(20), nullable=False, default="operador")
    activo = Column(Boolean, nullable=False, default=True)
    creado_en = Column(DateTime, default=datetime.utcnow)


class Cliente(Base):
    __tablename__ = "clientes"
    id = Column(Integer, primary_key=True)
    nombre = Column(String(120), nullable=False)
    telefono = Column(String(30), nullable=False)
    email = Column(String(120), nullable=True)
    creado_en = Column(DateTime, default=datetime.utcnow)
    direcciones = relationship("Direccion", back_populates="cliente", cascade="all, delete-orphan")


class Direccion(Base):
    __tablename__ = "direcciones"
    id = Column(Integer, primary_key=True)
    cliente_id = Column(Integer, ForeignKey("clientes.id"), nullable=False)
    ciudad_id = Column(Integer, ForeignKey("ciudades.id"), nullable=False)
    direccion = Column(String(200), nullable=False)
    etiqueta = Column(String(40), nullable=True)
    cliente = relationship("Cliente", back_populates="direcciones")
    ciudad = relationship("Ciudad")


class Repartidor(Base):
    __tablename__ = "repartidores"
    id = Column(Integer, primary_key=True)
    nombre = Column(String(80), nullable=False)
    telefono = Column(String(30), nullable=False)
    vehiculo = Column(String(40), nullable=False)
    estado = Column(String(20), nullable=False, default="disponible")
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    actualizado_en = Column(DateTime, default=datetime.utcnow)


class Envio(Base):
    __tablename__ = "envios"
    id = Column(Integer, primary_key=True)
    numero_guia = Column(String(20), unique=True, nullable=False, index=True)

    remitente_cliente_id = Column(Integer, ForeignKey("clientes.id"), nullable=False)
    remitente_direccion_id = Column(Integer, ForeignKey("direcciones.id"), nullable=False)
    destinatario_cliente_id = Column(Integer, ForeignKey("clientes.id"), nullable=False)
    destinatario_direccion_id = Column(Integer, ForeignKey("direcciones.id"), nullable=False)

    servicio_id = Column(Integer, ForeignKey("servicios.id"), nullable=False)
    tipo_paquete_id = Column(Integer, ForeignKey("tipos_paquete.id"), nullable=False)

    peso_kg = Column(Float, nullable=False)
    dimensiones_cm = Column(String(40), nullable=False)
    valor_declarado = Column(Integer, nullable=False)
    notas_entrega = Column(Text, nullable=True)

    subtotal = Column(Integer, nullable=False)
    seguro = Column(Integer, nullable=False)
    iva = Column(Integer, nullable=False)
    total = Column(Integer, nullable=False)

    estado_id = Column(Integer, ForeignKey("estados_envio.id"), nullable=False)
    repartidor_id = Column(Integer, ForeignKey("repartidores.id"), nullable=True)

    fecha_creacion = Column(DateTime, default=datetime.utcnow)
    fecha_estimada = Column(DateTime, nullable=False)

    creado_por_usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)

    remitente = relationship("Cliente", foreign_keys=[remitente_cliente_id])
    destinatario = relationship("Cliente", foreign_keys=[destinatario_cliente_id])
    remitente_direccion = relationship("Direccion", foreign_keys=[remitente_direccion_id])
    destinatario_direccion = relationship("Direccion", foreign_keys=[destinatario_direccion_id])
    servicio = relationship("Servicio")
    tipo_paquete = relationship("TipoPaquete")
    estado = relationship("EstadoEnvio")
    repartidor = relationship("Repartidor")
    creado_por = relationship("Usuario")
    historial = relationship("EnvioHistorial", back_populates="envio", cascade="all, delete-orphan", order_by="EnvioHistorial.fecha")


class EnvioHistorial(Base):
    __tablename__ = "envio_historial"
    id = Column(Integer, primary_key=True)
    envio_id = Column(Integer, ForeignKey("envios.id"), nullable=False)
    estado_id = Column(Integer, ForeignKey("estados_envio.id"), nullable=False)
    ubicacion = Column(String(120), nullable=True)
    descripcion = Column(Text, nullable=True)
    fecha = Column(DateTime, default=datetime.utcnow, nullable=False)
    registrado_por_usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True)

    envio = relationship("Envio", back_populates="historial")
    estado = relationship("EstadoEnvio")


class Alerta(Base):
    __tablename__ = "alertas"
    id = Column(Integer, primary_key=True)
    envio_id = Column(Integer, ForeignKey("envios.id"), nullable=True)
    tipo = Column(String(30), nullable=False)
    mensaje = Column(String(300), nullable=False)
    fecha = Column(DateTime, default=datetime.utcnow)
    leida = Column(Boolean, default=False)

    envio = relationship("Envio")
