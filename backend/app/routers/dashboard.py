from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Alerta, Envio, EstadoEnvio, Usuario
from ..schemas import (
    AlertaOut, DashboardOut, DistribucionItem, EnvioListItem, EstadoOut, KpiCard, PuntoSerie,
)
from ..security import usuario_actual

router = APIRouter(prefix="/api/dashboard", tags=["tablero"])


@router.get("/resumen", response_model=DashboardOut)
def resumen(db: Session = Depends(get_db), _user: Usuario = Depends(usuario_actual)):
    ahora = datetime.utcnow()
    inicio_hoy = ahora.replace(hour=0, minute=0, second=0, microsecond=0)
    inicio_ayer = inicio_hoy - timedelta(days=1)

    def cuenta_estado(codigo: str, desde: datetime | None = None) -> int:
        q = db.query(Envio).join(EstadoEnvio, Envio.estado_id == EstadoEnvio.id).filter(EstadoEnvio.codigo == codigo)
        if desde is not None:
            q = q.filter(Envio.fecha_creacion >= desde)
        return q.count()

    envios_hoy = db.query(Envio).filter(Envio.fecha_creacion >= inicio_hoy).count()
    envios_ayer = db.query(Envio).filter(Envio.fecha_creacion >= inicio_ayer, Envio.fecha_creacion < inicio_hoy).count()
    en_transito = cuenta_estado("en_transito")
    entregados_hoy = cuenta_estado("entregado", inicio_hoy)
    retrasados = cuenta_estado("retrasado")

    def delta(actual: int, ref: int) -> float:
        if ref == 0:
            return 0.0 if actual == 0 else 100.0
        return round(((actual - ref) / ref) * 100, 1)

    kpis = [
        KpiCard(titulo="Envíos hoy", valor=envios_hoy, delta=delta(envios_hoy, envios_ayer or 1), sentido="up", color="azul"),
        KpiCard(titulo="En tránsito", valor=en_transito, delta=5.0, sentido="up", color="ambar"),
        KpiCard(titulo="Entregados hoy", valor=entregados_hoy, delta=18.0, sentido="up", color="verde"),
        KpiCard(titulo="Retrasados", valor=retrasados, delta=-25.0, sentido="down", color="rojo"),
    ]

    serie = []
    dias_es = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]
    for i in range(6, -1, -1):
        d_ini = inicio_hoy - timedelta(days=i)
        d_fin = d_ini + timedelta(days=1)
        cuenta = db.query(Envio).filter(Envio.fecha_creacion >= d_ini, Envio.fecha_creacion < d_fin).count()
        serie.append(PuntoSerie(etiqueta=dias_es[d_ini.weekday()], valor=cuenta))

    estados_para_dona = ["en_transito", "entregado", "creado", "retrasado"]
    color_por_estado = {"en_transito": "#F59E0B", "entregado": "#16A34A", "creado": "#2563EB", "retrasado": "#DC2626"}
    nombre_por_estado = {"en_transito": "En tránsito", "entregado": "Entregados", "creado": "En preparación", "retrasado": "Retrasados"}
    distribucion = []
    total_dist = 0
    cuentas = {}
    for codigo in estados_para_dona:
        c = (
            db.query(func.count(Envio.id))
            .join(EstadoEnvio, Envio.estado_id == EstadoEnvio.id)
            .filter(EstadoEnvio.codigo == codigo)
            .scalar()
            or 0
        )
        cuentas[codigo] = c
        total_dist += c
    for codigo in estados_para_dona:
        c = cuentas[codigo]
        porcentaje = round((c / total_dist) * 100, 0) if total_dist else 0
        distribucion.append(
            DistribucionItem(
                estado=nombre_por_estado[codigo],
                color=color_por_estado[codigo],
                cantidad=c,
                porcentaje=porcentaje,
            )
        )

    recientes = db.query(Envio).order_by(Envio.fecha_creacion.desc()).limit(6).all()
    recientes_out = [
        EnvioListItem(
            id=e.id,
            numero_guia=e.numero_guia,
            cliente_destinatario=e.destinatario.nombre,
            ciudad_destino=e.destinatario_direccion.ciudad.nombre,
            estado=EstadoOut.model_validate(e.estado),
            fecha_creacion=e.fecha_creacion,
            total=e.total,
        )
        for e in recientes
    ]

    alertas = db.query(Alerta).order_by(Alerta.fecha.desc()).limit(8).all()
    alertas_out = [
        AlertaOut(
            id=a.id,
            tipo=a.tipo,
            mensaje=a.mensaje,
            fecha=a.fecha,
            envio_guia=a.envio.numero_guia if a.envio else None,
        )
        for a in alertas
    ]

    return DashboardOut(
        fecha=ahora,
        kpis=kpis,
        serie_dias=serie,
        distribucion=distribucion,
        distribucion_total=total_dist,
        recientes=recientes_out,
        alertas=alertas_out,
    )
