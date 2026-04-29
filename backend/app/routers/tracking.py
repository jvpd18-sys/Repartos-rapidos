from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Envio
from ..schemas import EstadoOut, HistorialItem, TrackingOut

router = APIRouter(prefix="/api/track", tags=["rastreo público"])


@router.get("/{guia}", response_model=TrackingOut)
def rastrear(guia: str, db: Session = Depends(get_db)):
    envio = db.query(Envio).filter(Envio.numero_guia == guia.strip().upper()).first()
    if not envio:
        raise HTTPException(404, "No encontramos la guía ingresada. Verifica el número e inténtalo de nuevo.")
    rem_dir = envio.remitente_direccion
    dst_dir = envio.destinatario_direccion
    return TrackingOut(
        numero_guia=envio.numero_guia,
        estado=EstadoOut.model_validate(envio.estado),
        origen_ciudad=rem_dir.ciudad.nombre,
        origen_departamento=rem_dir.ciudad.departamento,
        destino_ciudad=dst_dir.ciudad.nombre,
        destino_departamento=dst_dir.ciudad.departamento,
        destinatario=envio.destinatario.nombre,
        direccion_destino=dst_dir.direccion,
        fecha_estimada=envio.fecha_estimada,
        historial=[
            HistorialItem(
                estado=EstadoOut.model_validate(h.estado),
                ubicacion=h.ubicacion,
                descripcion=h.descripcion,
                fecha=h.fecha,
            )
            for h in envio.historial
        ],
    )
