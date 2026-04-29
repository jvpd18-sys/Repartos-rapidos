from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Repartidor, Usuario
from ..schemas import RepartidorOut, UbicacionRepartidor
from ..security import usuario_actual

router = APIRouter(prefix="/api/repartidores", tags=["repartidores"])


@router.get("", response_model=list[RepartidorOut])
def listar(db: Session = Depends(get_db), _user: Usuario = Depends(usuario_actual)):
    return db.query(Repartidor).order_by(Repartidor.nombre).all()


@router.get("/ubicaciones", response_model=list[UbicacionRepartidor])
def ubicaciones(db: Session = Depends(get_db), _user: Usuario = Depends(usuario_actual)):
    repartidores = db.query(Repartidor).filter(Repartidor.estado != "inactivo").all()
    return [
        UbicacionRepartidor(
            id=r.id, nombre=r.nombre, vehiculo=r.vehiculo, estado=r.estado, lat=r.lat, lng=r.lng
        )
        for r in repartidores
    ]
