from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Ciudad, EstadoEnvio, Servicio, TipoPaquete, Usuario
from ..schemas import CiudadOut, EstadoOut, ServicioOut, TipoPaqueteOut
from ..security import usuario_actual

router = APIRouter(prefix="/api/catalogos", tags=["catálogos"])


@router.get("/ciudades", response_model=list[CiudadOut])
def ciudades(db: Session = Depends(get_db), _user: Usuario = Depends(usuario_actual)):
    return db.query(Ciudad).order_by(Ciudad.nombre).all()


@router.get("/servicios", response_model=list[ServicioOut])
def servicios(db: Session = Depends(get_db), _user: Usuario = Depends(usuario_actual)):
    return db.query(Servicio).order_by(Servicio.tarifa_base).all()


@router.get("/tipos-paquete", response_model=list[TipoPaqueteOut])
def tipos(db: Session = Depends(get_db), _user: Usuario = Depends(usuario_actual)):
    return db.query(TipoPaquete).order_by(TipoPaquete.id).all()


@router.get("/estados", response_model=list[EstadoOut])
def estados(db: Session = Depends(get_db), _user: Usuario = Depends(usuario_actual)):
    return db.query(EstadoEnvio).order_by(EstadoEnvio.id).all()
