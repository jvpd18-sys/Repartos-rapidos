from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Cliente, Usuario
from ..schemas import ClienteIn, ClienteOut
from ..security import usuario_actual

router = APIRouter(prefix="/api/clientes", tags=["clientes"])


@router.get("", response_model=list[ClienteOut])
def listar(db: Session = Depends(get_db), _user: Usuario = Depends(usuario_actual)):
    return db.query(Cliente).order_by(Cliente.nombre).all()


@router.post("", response_model=ClienteOut, status_code=201)
def crear(datos: ClienteIn, db: Session = Depends(get_db), _user: Usuario = Depends(usuario_actual)):
    if db.query(Cliente).filter(Cliente.telefono == datos.telefono).first():
        raise HTTPException(400, "Ya existe un cliente con ese teléfono")
    cli = Cliente(nombre=datos.nombre, telefono=datos.telefono, email=datos.email)
    db.add(cli)
    db.commit()
    db.refresh(cli)
    return cli
