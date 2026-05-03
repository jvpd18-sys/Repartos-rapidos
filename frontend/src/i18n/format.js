import dayjs from "dayjs";

const monedaCO = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const numeroCO = new Intl.NumberFormat("es-CO");

export const formatoMoneda = (valor) => monedaCO.format(Number(valor || 0)).replace("COP", "$").replace("\u00A0", " ");

export const formatoNumero = (valor) => numeroCO.format(Number(valor || 0));

export const formatoPeso = (kg) => `${Number(kg || 0).toString().replace(".", ",")} kg`;

export const formatoFechaCorta = (iso) => dayjs(iso).format("DD MMM · HH:mm");

export const formatoFechaLarga = (iso) =>
  dayjs(iso).format("dddd, D [de] MMMM [de] YYYY").replace(/^./, (c) => c.toUpperCase());

export const formatoVentana = (iso) => dayjs(iso).format("ddd D MMM · h:mm A").replace(/^./, (c) => c.toUpperCase());

export const formatoHoyHora = (iso) => `Hoy · ${dayjs(iso).format("HH:mm")}`;

export const haceCuanto = (iso) => {
  const min = dayjs().diff(dayjs(iso), "minute");
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  return `hace ${d} d`;
};
