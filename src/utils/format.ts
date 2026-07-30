import type { CityRecord, TemperatureUnit } from "../types/weather.ts";
import { WEATHER_CODES } from "./constants.ts";

export function normalizeCityLabel(city: Pick<CityRecord, "name" | "admin1" | "country">) {
  return [city.name, city.admin1, city.country].filter(Boolean).join(", ");
}

export function unitSymbol(unit: TemperatureUnit) {
  return unit === "celsius" ? "°C" : "°F";
}

export function weatherLabel(code?: number) {
  if (typeof code !== "number") {
    return "Desconocido";
  }

  return WEATHER_CODES[code] ?? `Código ${code}`;
}

export function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function formatCurrentTime(time?: string) {
  if (!time) {
    return "No disponible";
  }

  const date = new Date(time);

  if (Number.isNaN(date.getTime())) {
    return time;
  }

  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatForecastDay(time?: string) {
  if (!time) {
    return "Fecha no disponible";
  }

  const date = new Date(time);

  if (Number.isNaN(date.getTime())) {
    return time;
  }

  return new Intl.DateTimeFormat("es-ES", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  }).format(date);
}
