from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from .database import Base, SessionLocal, engine
from .models import (
    Alerta, Ciudad, Cliente, Direccion, Envio, EnvioHistorial, EstadoEnvio,
    Repartidor, Servicio, TipoPaquete, Usuario,
)
from .security import hash_password
from .utils.pricing import calcular_costos, fecha_estimada_desde


def crear_tablas():
    Base.metadata.create_all(bind=engine)


def run_if_empty():
    crear_tablas()
    db = SessionLocal()
    try:
        if db.query(Usuario).count() > 0:
            return
        _sembrar(db)
    finally:
        db.close()


def _sembrar(db: Session):
    ciudades = [
        Ciudad(nombre="Bogotá D.C.", departamento="Cundinamarca"),
        Ciudad(nombre="Medellín", departamento="Antioquia"),
        Ciudad(nombre="Cali", departamento="Valle del Cauca"),
        Ciudad(nombre="Barranquilla", departamento="Atlántico"),
        Ciudad(nombre="Cartagena", departamento="Bolívar"),
        Ciudad(nombre="Bucaramanga", departamento="Santander"),
        Ciudad(nombre="Pereira", departamento="Risaralda"),
        Ciudad(nombre="Manizales", departamento="Caldas"),
    ]
    db.add_all(ciudades)
    db.flush()

    tipos = [
        TipoPaquete(codigo="caja", nombre="Caja"),
        TipoPaquete(codigo="sobre", nombre="Sobre"),
        TipoPaquete(codigo="tubo", nombre="Tubo"),
        TipoPaquete(codigo="fragil", nombre="Frágil"),
    ]
    db.add_all(tipos)

    servicios = [
        Servicio(codigo="estandar", nombre="Estándar", dias_min=3, dias_max=5, tarifa_base=12000),
        Servicio(codigo="express", nombre="Express", dias_min=1, dias_max=2, tarifa_base=22000),
        Servicio(codigo="mismo_dia", nombre="Mismo día", dias_min=0, dias_max=1, tarifa_base=38000),
    ]
    db.add_all(servicios)

    estados = [
        EstadoEnvio(codigo="creado", nombre="Creado", color="#2563EB"),
        EstadoEnvio(codigo="recolectado", nombre="Recolectado", color="#0EA5E9"),
        EstadoEnvio(codigo="en_transito", nombre="En tránsito", color="#F59E0B"),
        EstadoEnvio(codigo="en_reparto", nombre="En reparto", color="#A855F7"),
        EstadoEnvio(codigo="entregado", nombre="Entregado", color="#16A34A"),
        EstadoEnvio(codigo="retrasado", nombre="Retrasado", color="#DC2626"),
        EstadoEnvio(codigo="incidencia", nombre="Incidencia", color="#DC2626"),
        EstadoEnvio(codigo="cancelado", nombre="Cancelado", color="#475569"),
    ]
    db.add_all(estados)
    db.flush()

    admin = Usuario(
        nombre="Administrador",
        email="admin@repartosrapidos.co",
        password_hash=hash_password("Reparto2026!"),
        rol="admin",
    )
    operador = Usuario(
        nombre="Mariana Restrepo",
        email="mariana.restrepo@repartosrapidos.co",
        password_hash=hash_password("Reparto2026!"),
        rol="operador",
    )
    db.add_all([admin, operador])
    db.flush()

    repartidores = [
        Repartidor(nombre="Andrés Gómez", telefono="+57 311 555 0102", vehiculo="V-02 · Moto", estado="en_ruta", lat=4.6521, lng=-74.0826),
        Repartidor(nombre="Felipe López", telefono="+57 312 555 0103", vehiculo="V-04 · Moto", estado="disponible", lat=4.6097, lng=-74.0817),
        Repartidor(nombre="Diana Ortiz", telefono="+57 313 555 0104", vehiculo="V-07 · Furgón", estado="en_ruta", lat=4.7110, lng=-74.0721),
        Repartidor(nombre="Carlos Mejía", telefono="+57 314 555 0105", vehiculo="V-09 · Moto", estado="disponible", lat=4.6486, lng=-74.0972),
    ]
    db.add_all(repartidores)
    db.flush()

    bogota = ciudades[0]; medellin = ciudades[1]; cali = ciudades[2]; barranquilla = ciudades[3]; cartagena = ciudades[4]; bucaramanga = ciudades[5]; pereira = ciudades[6]

    def crear_persona(nombre, tel, dir_, ciudad):
        cli = Cliente(nombre=nombre, telefono=tel)
        db.add(cli)
        db.flush()
        d = Direccion(cliente_id=cli.id, ciudad_id=ciudad.id, direccion=dir_)
        db.add(d)
        db.flush()
        return cli, d

    ana, ana_dir = crear_persona("Ana Martínez", "+57 310 445 9821", "Cra 45 #12-80, Apto 302", bogota)
    carlos, carlos_dir = crear_persona("Carlos Ramírez", "+57 321 778 4512", "Calle 98 #8-55, Torre B", medellin)
    laura, laura_dir = crear_persona("Laura Gómez", "+57 311 220 9912", "Calle 30 #62-15", medellin)
    juan, juan_dir = crear_persona("Juan Torres", "+57 318 712 5567", "Av 5 N #23-44", cali)
    ana_s, ana_s_dir = crear_persona("Ana Sánchez", "+57 317 998 1212", "Cl 35 #18-02", bucaramanga)
    felipe, felipe_dir = crear_persona("Felipe López", "+57 304 110 7890", "Cra 53 #76-21", barranquilla)
    camila, camila_dir = crear_persona("Camila Ruiz", "+57 313 887 4421", "Cl 17 #8-33", pereira)
    diego, diego_dir = crear_persona("Diego Páez", "+57 320 654 2210", "Cra 4 #34-10, Manga", cartagena)
    sofia, sofia_dir = crear_persona("Sofía Herrera", "+57 312 332 5511", "Cl 70 #11-30", bogota)
    mateo, mateo_dir = crear_persona("Mateo Rincón", "+57 315 884 6677", "Cra 80 #45-12", medellin)

    estados_dict = {e.codigo: e for e in estados}
    servicios_dict = {s.codigo: s for s in servicios}
    tipos_dict = {t.codigo: t for t in tipos}

    ahora = datetime.utcnow()
    hoy_inicio = ahora.replace(hour=0, minute=0, second=0, microsecond=0)

    envios_demo = [
        # (numero, rem, rem_dir, dst, dst_dir, servicio, tipo, peso, dim, valor, estado, fecha_offset_horas, repartidor_idx)
        ("ENV-2026-00142", ana, ana_dir, carlos, carlos_dir, "express", "caja", 2.4, "30 x 20 x 15", 180000, "en_transito", -8, 0),
        ("ENV-2026-00141", ana, ana_dir, juan, juan_dir, "estandar", "caja", 1.8, "25 x 18 x 12", 95000, "entregado", -28, 1),
        ("ENV-2026-00140", sofia, sofia_dir, ana_s, ana_s_dir, "estandar", "sobre", 0.4, "32 x 24 x 2", 50000, "creado", -3, None),
        ("ENV-2026-00139", felipe, felipe_dir, ana, ana_dir, "express", "caja", 3.1, "35 x 25 x 20", 220000, "retrasado", -30, 2),
        ("ENV-2026-00138", mateo, mateo_dir, camila, camila_dir, "estandar", "fragil", 0.9, "20 x 15 x 10", 320000, "en_transito", -5, 3),
        ("ENV-2026-00137", carlos, carlos_dir, diego, diego_dir, "estandar", "tubo", 1.2, "60 x 10 x 10", 120000, "entregado", -32, 1),
        ("ENV-2026-00136", laura, laura_dir, ana, ana_dir, "express", "caja", 2.0, "28 x 22 x 14", 150000, "entregado", -50, 0),
        ("ENV-2026-00135", ana_s, ana_s_dir, sofia, sofia_dir, "estandar", "sobre", 0.3, "32 x 24 x 2", 40000, "entregado", -55, 1),
        ("ENV-2026-00134", juan, juan_dir, felipe, felipe_dir, "mismo_dia", "caja", 1.5, "26 x 20 x 12", 90000, "en_transito", -2, 2),
        ("ENV-2026-00133", camila, camila_dir, mateo, mateo_dir, "estandar", "caja", 2.7, "32 x 22 x 18", 200000, "creado", -1, None),
        ("ENV-2026-00132", diego, diego_dir, ana_s, ana_s_dir, "express", "fragil", 0.8, "22 x 16 x 12", 280000, "creado", -1, None),
        ("ENV-2026-00131", sofia, sofia_dir, laura, laura_dir, "estandar", "caja", 1.6, "28 x 18 x 12", 110000, "entregado", -72, 0),
    ]

    for (numero, rem, rem_dir, dst, dst_dir, srv_cod, tp_cod, peso, dim, valor, estado_cod, h_off, rep_idx) in envios_demo:
        srv = servicios_dict[srv_cod]
        costos = calcular_costos(srv.tarifa_base, valor)
        creado = ahora + timedelta(hours=h_off)
        estimada = fecha_estimada_desde(creado, srv.dias_max)
        env = Envio(
            numero_guia=numero,
            remitente_cliente_id=rem.id,
            remitente_direccion_id=rem_dir.id,
            destinatario_cliente_id=dst.id,
            destinatario_direccion_id=dst_dir.id,
            servicio_id=srv.id,
            tipo_paquete_id=tipos_dict[tp_cod].id,
            peso_kg=peso,
            dimensiones_cm=dim,
            valor_declarado=valor,
            subtotal=costos["subtotal"],
            seguro=costos["seguro"],
            iva=costos["iva"],
            total=costos["total"],
            estado_id=estados_dict[estado_cod].id,
            repartidor_id=repartidores[rep_idx].id if rep_idx is not None else None,
            fecha_creacion=creado,
            fecha_estimada=estimada,
            creado_por_usuario_id=admin.id,
        )
        db.add(env)
        db.flush()

        flujo = ["creado", "recolectado", "en_transito", "en_reparto", "entregado"]
        if estado_cod == "retrasado":
            secuencia = ["creado", "recolectado", "en_transito", "retrasado"]
        elif estado_cod == "cancelado":
            secuencia = ["creado", "cancelado"]
        elif estado_cod in flujo:
            idx = flujo.index(estado_cod)
            secuencia = flujo[: idx + 1]
        else:
            secuencia = ["creado", estado_cod]

        for i, est_cod in enumerate(secuencia):
            fecha_evt = creado + timedelta(hours=i * 4)
            ubicacion = rem_dir.ciudad.nombre if i < 2 else (
                dst_dir.ciudad.nombre if est_cod in ("en_reparto", "entregado") else "Centro de distribución La Pintada"
            )
            descripciones = {
                "creado": "El remitente registró el envío en el sistema.",
                "recolectado": "El paquete fue recolectado por el mensajero.",
                "en_transito": "El paquete está en tránsito hacia el centro de distribución.",
                "en_reparto": "El paquete está en reparto en la ciudad de destino.",
                "entregado": "El paquete fue entregado satisfactoriamente.",
                "retrasado": "El envío presenta un retraso. Estimamos resolverlo en las próximas horas.",
                "cancelado": "El operador canceló el envío.",
            }
            db.add(
                EnvioHistorial(
                    envio_id=env.id,
                    estado_id=estados_dict[est_cod].id,
                    ubicacion=ubicacion,
                    descripcion=descripciones.get(est_cod, ""),
                    fecha=fecha_evt,
                    registrado_por_usuario_id=admin.id,
                )
            )

    db.flush()

    alertas = [
        Alerta(envio_id=db.query(Envio).filter(Envio.numero_guia == "ENV-2026-00139").first().id, tipo="retraso", mensaje="ENV-2026-00139 retrasado · Entrega programada hace 2 h · Felipe López · Barranquilla", fecha=ahora - timedelta(minutes=24)),
        Alerta(tipo="stock", mensaje="Stock bajo: sobres M · Quedan 12 unidades · Bodega Central", fecha=ahora - timedelta(hours=1)),
        Alerta(tipo="cliente", mensaje="Nuevo cliente registrado · Distribuidora LogiCol firmó contrato corporativo", fecha=ahora - timedelta(hours=3)),
        Alerta(envio_id=None, tipo="vehiculo", mensaje="Vehículo V-09 en ruta larga · Bogotá → Cali · ETA 19:30", fecha=ahora - timedelta(hours=4)),
    ]
    db.add_all(alertas)

    db.commit()
