import type { CityRecord, ForecastResponse, TemperatureUnit } from "../types/weather.ts";

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} al consultar ${url}`);
  }

  return (await response.json()) as T;
}

export async function fetchForecast(city: CityRecord, unit: TemperatureUnit, includeDaily = false) {
  const params = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    current: "temperature_2m,apparent_temperature,wind_speed_10m,weather_code,is_day",
    timezone: "auto",
    temperature_unit: unit,
  });

  if (includeDaily) {
    params.set(
      "daily",
      "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max",
    );
    params.set("forecast_days", "7");
  }

  const data = await fetchJson<ForecastResponse>(`https://api.open-meteo.com/v1/forecast?${params}`);

  return data;
}
