from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import (
    Cliente, Direccion, Envio, EnvioHistorial, EstadoEnvio, Repartidor, Servicio, TipoPaquete, Usuario,
)
from ..schemas import (
    EnvioActualizarIn, EnvioDetalle, EnvioIn, EnvioListItem, EstadoOut, HistorialItem,
    PersonaOut, RepartidorOut, ServicioOut, TipoPaqueteOut,
)
from ..security import usuario_actual
from ..utils.labels import generar_etiqueta_png
from ..utils.pricing import calcular_costos, fecha_estimada_desde, generar_numero_guia

router = APIRouter(prefix="/api/paquetes", tags=["envíos"])


def _persona_out(cliente: Cliente, direccion: Direccion) -> PersonaOut:
    return PersonaOut(
        nombre=cliente.nombre,
        telefono=cliente.telefono,
        direccion=direccion.direccion,
        ciudad=direccion.ciudad.nombre,
        departamento=direccion.ciudad.departamento,
    )


def _detalle_envio(env: Envio) -> EnvioDetalle:
    return EnvioDetalle(
        id=env.id,
        numero_guia=env.numero_guia,
        estado=EstadoOut.model_validate(env.estado),
        servicio=ServicioOut.model_validate(env.servicio),
        tipo_paquete=TipoPaqueteOut.model_validate(env.tipo_paquete),
        peso_kg=env.peso_kg,
        dimensiones_cm=env.dimensiones_cm,
        valor_declarado=env.valor_declarado,
        notas_entrega=env.notas_entrega,
        subtotal=env.subtotal,
        seguro=env.seguro,
        iva=env.iva,
        total=env.total,
        fecha_creacion=env.fecha_creacion,
        fecha_estimada=env.fecha_estimada,
        remitente=_persona_out(env.remitente, env.remitente_direccion),
        destinatario=_persona_out(env.destinatario, env.destinatario_direccion),
        repartidor=RepartidorOut.model_validate(env.repartidor) if env.repartidor else None,
        historial=[
            HistorialItem(
                estado=EstadoOut.model_validate(h.estado),
                ubicacion=h.ubicacion,
                descripcion=h.descripcion,
                fecha=h.fecha,
            )
            for h in env.historial
        ],
    )


@router.get("", response_model=list[EnvioListItem])
def listar(
    estado: Optional[str] = None,
    busqueda: Optional[str] = None,
    limite: int = 50,
    db: Session = Depends(get_db),
    _user: Usuario = Depends(usuario_actual),
):
    q = db.query(Envio).join(EstadoEnvio, Envio.estado_id == EstadoEnvio.id)
    if estado:
        q = q.filter(EstadoEnvio.codigo == estado)
    if busqueda:
        like = f"%{busqueda.lower()}%"
        q = q.outerjoin(Cliente, Envio.destinatario_cliente_id == Cliente.id).filter(
            or_(Envio.numero_guia.ilike(like), Cliente.nombre.ilike(like))
        )
    envios = q.order_by(Envio.fecha_creacion.desc()).limit(limite).all()
    return [_to_list_item(e) for e in envios]


def _to_list_item(env: Envio) -> EnvioListItem:
    return EnvioListItem(
        id=env.id,
        numero_guia=env.numero_guia,
        cliente_destinatario=env.destinatario.nombre,
        ciudad_destino=env.destinatario_direccion.ciudad.nombre,
        estado=EstadoOut.model_validate(env.estado),
        fecha_creacion=env.fecha_creacion,
        total=env.total,
    )


@router.post("", response_model=EnvioDetalle, status_code=status.HTTP_201_CREATED)
def crear(datos: EnvioIn, db: Session = Depends(get_db), user: Usuario = Depends(usuario_actual)):
    servicio = db.query(Servicio).get(datos.servicio_id)
    if not servicio:
        raise HTTPException(400, "Servicio no encontrado")
    tipo = db.query(TipoPaquete).get(datos.paquete.tipo_paquete_id)
    if not tipo:
        raise HTTPException(400, "Tipo de paquete no encontrado")

    rem_cliente = _crear_o_buscar_cliente(db, datos.remitente.nombre, datos.remitente.telefono)
    rem_dir = _crear_o_buscar_direccion(db, rem_cliente.id, datos.remitente.ciudad_id, datos.remitente.direccion)

    dst_cliente = _crear_o_buscar_cliente(db, datos.destinatario.nombre, datos.destinatario.telefono)
    dst_dir = _crear_o_buscar_direccion(db, dst_cliente.id, datos.destinatario.ciudad_id, datos.destinatario.direccion)

    costos = calcular_costos(servicio.tarifa_base, datos.paquete.valor_declarado)
    ahora = datetime.utcnow()
    estimada = fecha_estimada_desde(ahora, servicio.dias_max)

    estado_creado = db.query(EstadoEnvio).filter(EstadoEnvio.codigo == "creado").first()

    siguiente = (db.query(Envio).count() or 0) + 1
    numero_guia = generar_numero_guia(siguiente, ahora.year)
    while db.query(Envio).filter(Envio.numero_guia == numero_guia).first():
        siguiente += 1
        numero_guia = generar_numero_guia(siguiente, ahora.year)

    envio = Envio(
        numero_guia=numero_guia,
        remitente_cliente_id=rem_cliente.id,
        remitente_direccion_id=rem_dir.id,
        destinatario_cliente_id=dst_cliente.id,
        destinatario_direccion_id=dst_dir.id,
        servicio_id=servicio.id,
        tipo_paquete_id=tipo.id,
        peso_kg=datos.paquete.peso_kg,
        dimensiones_cm=datos.paquete.dimensiones_cm,
        valor_declarado=datos.paquete.valor_declarado,
        notas_entrega=datos.notas_entrega,
        subtotal=costos["subtotal"],
        seguro=costos["seguro"],
        iva=costos["iva"],
        total=costos["total"],
        estado_id=estado_creado.id,
        fecha_creacion=ahora,
        fecha_estimada=estimada,
        creado_por_usuario_id=user.id,
    )
    db.add(envio)
    db.flush()
    db.add(
        EnvioHistorial(
            envio_id=envio.id,
            estado_id=estado_creado.id,
            ubicacion=f"{rem_dir.ciudad.nombre}",
            descripcion="El remitente registró el envío en el sistema.",
            fecha=ahora,
            registrado_por_usuario_id=user.id,
        )
    )
    db.commit()
    db.refresh(envio)
    return _detalle_envio(envio)


def _crear_o_buscar_cliente(db: Session, nombre: str, telefono: str) -> Cliente:
    existente = db.query(Cliente).filter(Cliente.telefono == telefono).first()
    if existente:
        return existente
    cliente = Cliente(nombre=nombre, telefono=telefono)
    db.add(cliente)
    db.flush()
    return cliente


def _crear_o_buscar_direccion(db: Session, cliente_id: int, ciudad_id: int, direccion: str) -> Direccion:
    existente = (
        db.query(Direccion)
        .filter(Direccion.cliente_id == cliente_id, Direccion.direccion == direccion, Direccion.ciudad_id == ciudad_id)
        .first()
    )
    if existente:
        return existente
    dir_obj = Direccion(cliente_id=cliente_id, ciudad_id=ciudad_id, direccion=direccion)
    db.add(dir_obj)
    db.flush()
    return dir_obj


@router.get("/{envio_id}", response_model=EnvioDetalle)
def obtener(envio_id: int, db: Session = Depends(get_db), _user: Usuario = Depends(usuario_actual)):
    envio = db.query(Envio).get(envio_id)
    if not envio:
        raise HTTPException(404, "Envío no encontrado")
    return _detalle_envio(envio)


@router.put("/{envio_id}", response_model=EnvioDetalle)
def actualizar(envio_id: int, datos: EnvioActualizarIn, db: Session = Depends(get_db), user: Usuario = Depends(usuario_actual)):
    envio = db.query(Envio).get(envio_id)
    if not envio:
        raise HTTPException(404, "Envío no encontrado")
    cambios = False
    if datos.repartidor_id is not None:
        rep = db.query(Repartidor).get(datos.repartidor_id)
        if not rep:
            raise HTTPException(400, "Repartidor no encontrado")
        envio.repartidor_id = rep.id
        cambios = True
    if datos.estado_codigo:
        estado = db.query(EstadoEnvio).filter(EstadoEnvio.codigo == datos.estado_codigo).first()
        if not estado:
            raise HTTPException(400, "Estado no encontrado")
        envio.estado_id = estado.id
        db.add(
            EnvioHistorial(
                envio_id=envio.id,
                estado_id=estado.id,
                ubicacion=datos.ubicacion,
                descripcion=datos.descripcion or f"Estado actualizado a {estado.nombre}.",
                fecha=datetime.utcnow(),
                registrado_por_usuario_id=user.id,
            )
        )
        cambios = True
    if not cambios:
        raise HTTPException(400, "No se enviaron cambios")
    db.commit()
    db.refresh(envio)
    return _detalle_envio(envio)


@router.post("/{envio_id}/cancelar", response_model=EnvioDetalle)
def cancelar(envio_id: int, db: Session = Depends(get_db), user: Usuario = Depends(usuario_actual)):
    envio = db.query(Envio).get(envio_id)
    if not envio:
        raise HTTPException(404, "Envío no encontrado")
    estado = db.query(EstadoEnvio).filter(EstadoEnvio.codigo == "cancelado").first()
    envio.estado_id = estado.id
    db.add(
        EnvioHistorial(
            envio_id=envio.id,
            estado_id=estado.id,
            descripcion="El operador canceló el envío.",
            fecha=datetime.utcnow(),
            registrado_por_usuario_id=user.id,
        )
    )
    db.commit()
    db.refresh(envio)
    return _detalle_envio(envio)


@router.get("/{envio_id}/etiqueta")
def etiqueta(envio_id: int, db: Session = Depends(get_db), _user: Usuario = Depends(usuario_actual)):
    envio = db.query(Envio).get(envio_id)
    if not envio:
        raise HTTPException(404, "Envío no encontrado")
    contenido = generar_etiqueta_png(envio)
    return Response(content=contenido, media_type="image/png")
