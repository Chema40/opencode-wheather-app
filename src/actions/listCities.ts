import type { AppState } from "../types/weather.ts";
import { normalizeCityLabel } from "../utils/format.ts";

export function listCities(state: AppState) {
  if (state.cities.length === 0) {
    console.log("\nNo hay ciudades guardadas.");
    return;
  }

  console.log("\nCiudades guardadas:");
  state.cities.forEach((city, index) => {
    console.log(`  ${index + 1}. ${normalizeCityLabel(city)}`);
  });
}
