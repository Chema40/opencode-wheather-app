import type { AppState } from "../types/weather.ts";
import { color } from "../utils/colors.ts";
import { normalizeCityLabel } from "../utils/format.ts";
import { saveState } from "../storage/state.ts";
import { chooseFromCities } from "../presentation/input.ts";

export async function removeCity(state: AppState) {
  if (state.cities.length === 0) {
    console.log("\nNo hay ciudades para eliminar.");
    return;
  }

  const chosen = await chooseFromCities(state.cities, "Selecciona la ciudad a eliminar");

  if (!chosen) {
    console.log("\nSelección inválida.");
    return;
  }

  state.cities = state.cities.filter((city) => city.id !== chosen.id);

  if (state.defaultCityId === chosen.id) {
    state.defaultCityId = null;
  }

  saveState(state);
  console.log(color.green(`\nCiudad eliminada: ${normalizeCityLabel(chosen)}`));
}
