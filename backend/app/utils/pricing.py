from datetime import datetime, timedelta


def calcular_costos(tarifa_base: int, valor_declarado: int) -> dict:
    subtotal = int(tarifa_base)
    seguro = round(valor_declarado * 0.01)
    iva = round(subtotal * 0.19)
    total = subtotal + seguro + iva
    return {"subtotal": subtotal, "seguro": int(seguro), "iva": int(iva), "total": int(total)}


def fecha_estimada_desde(fecha_creacion: datetime, dias_max: int) -> datetime:
    fecha = fecha_creacion
    agregados = 0
    while agregados < dias_max:
        fecha += timedelta(days=1)
        if fecha.weekday() < 5:
            agregados += 1
    return fecha.replace(hour=14, minute=0, second=0, microsecond=0)


def generar_numero_guia(siguiente_id: int, anio: int | None = None) -> str:
    if anio is None:
        anio = datetime.utcnow().year
    return f"ENV-{anio}-{siguiente_id:05d}"
