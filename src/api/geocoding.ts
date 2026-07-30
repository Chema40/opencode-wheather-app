import type { GeocodingResponse, GeocodingResult } from "../types/weather.ts";

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} al consultar ${url}`);
  }

  return (await response.json()) as T;
}

export async function searchCities(name: string): Promise<GeocodingResult[]> {
  const params = new URLSearchParams({
    name,
    count: "5",
    language: "es",
    format: "json",
  });

  const data = await fetchJson<GeocodingResponse>(
    `https://geocoding-api.open-meteo.com/v1/search?${params}`,
  );

  return data.results ?? [];
}
