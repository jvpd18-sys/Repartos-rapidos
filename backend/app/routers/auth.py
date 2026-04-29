from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Usuario
from ..schemas import LoginIn, RegistroIn, TokenOut, UsuarioOut
from ..security import crear_token, hash_password, usuario_actual, verify_password

router = APIRouter(prefix="/api/auth", tags=["autenticación"])


@router.post("/login", response_model=TokenOut)
def login(datos: LoginIn, db: Session = Depends(get_db)):
    user = db.query(Usuario).filter(Usuario.email == datos.email.lower()).first()
    if not user or not verify_password(datos.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales inválidas")
    if not user.activo:
        raise HTTPException(status_code=403, detail="Usuario inactivo")
    dias = 30 if datos.recordar else 1
    token = crear_token({"sub": str(user.id)}, dias=dias)
    return TokenOut(
        access_token=token,
        usuario={"id": user.id, "nombre": user.nombre, "email": user.email, "rol": user.rol},
    )


@router.post("/register", response_model=TokenOut)
def registrar(datos: RegistroIn, db: Session = Depends(get_db)):
    if db.query(Usuario).filter(Usuario.email == datos.email.lower()).first():
        raise HTTPException(status_code=400, detail="El correo ya está registrado")
    if len(datos.password) < 8:
        raise HTTPException(status_code=400, detail="La contraseña debe tener al menos 8 caracteres")
    user = Usuario(
        nombre=datos.nombre,
        email=datos.email.lower(),
        password_hash=hash_password(datos.password),
        rol="operador",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = crear_token({"sub": str(user.id)}, dias=1)
    return TokenOut(
        access_token=token,
        usuario={"id": user.id, "nombre": user.nombre, "email": user.email, "rol": user.rol},
    )


@router.get("/me", response_model=UsuarioOut)
def me(actual: Usuario = Depends(usuario_actual)):
    return actual
