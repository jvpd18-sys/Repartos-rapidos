import io
from PIL import Image, ImageDraw, ImageFont
import qrcode
import barcode
from barcode.writer import ImageWriter


def _fuente(tam: int) -> ImageFont.FreeTypeFont:
    for nombre in ("arial.ttf", "DejaVuSans.ttf", "DejaVuSans-Bold.ttf"):
        try:
            return ImageFont.truetype(nombre, tam)
        except OSError:
            continue
    return ImageFont.load_default()


def generar_etiqueta_png(envio) -> bytes:
    ancho, alto = 700, 950
    img = Image.new("RGB", (ancho, alto), "white")
    draw = ImageDraw.Draw(img)

    encabezado_alto = 110
    draw.rectangle([0, 0, ancho, encabezado_alto], fill="#0F172A")

    try:
        f_marca = _fuente(36)
        f_titulo = _fuente(44)
        f_sub = _fuente(20)
        f_label = _fuente(16)
        f_texto = _fuente(22)
        f_servicio = _fuente(16)
    except Exception:
        f_marca = f_titulo = f_sub = f_label = f_texto = f_servicio = ImageFont.load_default()

    draw.text((30, 30), "Repartos Rápidos S.A.S", fill="white", font=f_marca)

    servicio_texto = (envio.servicio.nombre if envio.servicio else "ESTÁNDAR").upper()
    pad_x = 14
    bbox = draw.textbbox((0, 0), servicio_texto, font=f_servicio)
    txt_ancho = bbox[2] - bbox[0]
    badge_x = ancho - txt_ancho - 60
    draw.rectangle([badge_x, 36, badge_x + txt_ancho + pad_x * 2, 76], fill="#F59E0B")
    draw.text((badge_x + pad_x, 46), servicio_texto, fill="#0F172A", font=f_servicio)

    qr = qrcode.QRCode(version=2, box_size=8, border=1)
    qr.add_data(envio.numero_guia)
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color="black", back_color="white").resize((220, 220))
    img.paste(qr_img, (40, encabezado_alto + 30))

    info_x = 290
    info_y = encabezado_alto + 30

    draw.text((info_x, info_y), "GUÍA N°", fill="#475569", font=f_label)
    draw.text((info_x, info_y + 24), envio.numero_guia, fill="#0F172A", font=f_titulo)

    creado = envio.fecha_creacion.strftime("%d %b %Y · %H:%M") if envio.fecha_creacion else ""
    draw.text((info_x, info_y + 90), f"Creado: {creado}", fill="#475569", font=f_label)

    bloque_y = encabezado_alto + 280
    draw.text((40, bloque_y), "DE", fill="#475569", font=f_label)
    rem = envio.remitente
    rem_dir = envio.remitente_direccion
    draw.text((40, bloque_y + 22), f"{rem.nombre} · {rem.telefono}", fill="#0F172A", font=f_texto)
    draw.text((40, bloque_y + 52), f"{rem_dir.direccion}, {rem_dir.ciudad.nombre}", fill="#475569", font=f_label)

    dest_y = bloque_y + 110
    draw.text((40, dest_y), "PARA", fill="#475569", font=f_label)
    dst = envio.destinatario
    dst_dir = envio.destinatario_direccion
    draw.text((40, dest_y + 22), dst.nombre, fill="#0F172A", font=f_titulo)
    draw.text((40, dest_y + 76), f"{dst_dir.direccion}", fill="#0F172A", font=f_texto)
    draw.text((40, dest_y + 106), f"{dst_dir.ciudad.nombre}, {dst_dir.ciudad.departamento}", fill="#475569", font=f_label)
    draw.text((40, dest_y + 130), f"Tel. {dst.telefono}", fill="#475569", font=f_label)

    code128 = barcode.get("code128", envio.numero_guia, writer=ImageWriter())
    bc_buffer = io.BytesIO()
    code128.write(bc_buffer, options={"write_text": True, "module_height": 14.0, "font_size": 10})
    bc_buffer.seek(0)
    bc_img = Image.open(bc_buffer)
    ratio = 600 / bc_img.width
    bc_img = bc_img.resize((600, int(bc_img.height * ratio)))
    img.paste(bc_img, ((ancho - bc_img.width) // 2, alto - bc_img.height - 30))

    out = io.BytesIO()
    img.save(out, format="PNG")
    return out.getvalue()
