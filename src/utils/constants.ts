import type { AppState } from "../types/weather.ts";
import { join } from "node:path";

export const STATE_FILE = join(process.cwd(), ".weather-cli-state.json");

export const DEFAULT_STATE: AppState = {
  cities: [],
  defaultCityId: null,
  temperatureUnit: "celsius",
};

export const WEATHER_CODES: Record<number, string> = {
  0: "Despejado",
  1: "Mayormente despejado",
  2: "Parcialmente nublado",
  3: "Nublado",
  45: "Niebla",
  48: "Niebla con escarcha",
  51: "Llovizna ligera",
  53: "Llovizna moderada",
  55: "Llovizna intensa",
  61: "Lluvia ligera",
  63: "Lluvia moderada",
  65: "Lluvia intensa",
  71: "Nieve ligera",
  73: "Nieve moderada",
  75: "Nieve intensa",
  80: "Chubascos ligeros",
  81: "Chubascos moderados",
  82: "Chubascos intensos",
  95: "Tormenta",
  96: "Tormenta con granizo",
  99: "Tormenta fuerte con granizo",
};
