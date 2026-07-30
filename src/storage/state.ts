import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { DEFAULT_STATE, STATE_FILE } from "../utils/constants.ts";
import type { AppState, CityRecord, TemperatureUnit } from "../types/weather.ts";

function isTemperatureUnit(value: unknown): value is TemperatureUnit {
  return value === "celsius" || value === "fahrenheit";
}

export function loadState(): AppState {
  if (!existsSync(STATE_FILE)) {
    return { ...DEFAULT_STATE };
  }

  try {
    const raw = JSON.parse(readFileSync(STATE_FILE, "utf8")) as Partial<AppState>;
    const cities = Array.isArray(raw.cities)
      ? raw.cities
          .map((city): CityRecord | null => {
            if (
              typeof city !== "object" ||
              city === null ||
              typeof city.id !== "string" ||
              typeof city.name !== "string" ||
              typeof city.latitude !== "number" ||
              typeof city.longitude !== "number"
            ) {
              return null;
            }

            return {
              id: city.id,
              name: city.name,
              admin1: typeof city.admin1 === "string" ? city.admin1 : undefined,
              country: typeof city.country === "string" ? city.country : undefined,
              latitude: city.latitude,
              longitude: city.longitude,
            };
          })
          .filter((city): city is CityRecord => city !== null)
      : [];

    const defaultCityId =
      typeof raw.defaultCityId === "string" && cities.some((city) => city.id === raw.defaultCityId)
        ? raw.defaultCityId
        : null;

    return {
      cities,
      defaultCityId,
      temperatureUnit: isTemperatureUnit(raw.temperatureUnit) ? raw.temperatureUnit : "celsius",
    };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

export function saveState(state: AppState) {
  writeFileSync(STATE_FILE, `${JSON.stringify(state, null, 2)}\n`, "utf8");
}
