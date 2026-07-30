import type { AppState } from "../types/weather.ts";
import { color } from "../utils/colors.ts";
import { normalizeCityLabel } from "../utils/format.ts";
import { saveState } from "../storage/state.ts";
import { chooseFromCities } from "../presentation/input.ts";

export async function setDefaultCity(state: AppState) {
  if (state.cities.length === 0) {
    console.log("\nNo hay ciudades guardadas.");
    return;
  }

  const chosen = await chooseFromCities(state.cities, "Selecciona la ciudad default");

  if (!chosen) {
    console.log("\nSelección inválida.");
    return;
  }

  state.defaultCityId = chosen.id;
  saveState(state);
  console.log(color.green(`\nCiudad default establecida: ${normalizeCityLabel(chosen)}`));
}
