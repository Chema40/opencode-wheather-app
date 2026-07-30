import type { AppState, CityRecord } from "../types/weather.ts";
import { color } from "../utils/colors.ts";
import { makeId, normalizeCityLabel } from "../utils/format.ts";
import { saveState } from "../storage/state.ts";
import { searchCities } from "../api/geocoding.ts";
import { chooseFromCities, ask } from "../presentation/input.ts";

export async function addCity(state: AppState) {
  const query = (await ask("\nNombre de la ciudad: ")).trim();

  if (!query) {
    console.log("\nDebes ingresar un nombre de ciudad.");
    return;
  }

  try {
    const results = await searchCities(query);

    if (results.length === 0) {
      console.log("\nNo se encontraron coincidencias.");
      return;
    }

    const chosen =
      results.length === 1
        ? results[0]
        : await chooseFromCities(
            results.map((result) => ({
              id: makeId(),
              name: result.name,
              admin1: result.admin1,
              country: result.country,
              latitude: result.latitude,
              longitude: result.longitude,
            })),
            "Selecciona la ciudad a guardar",
          );

    if (!chosen) {
      console.log("\nSelección inválida.");
      return;
    }

    const city: CityRecord = {
      id: makeId(),
      name: chosen.name,
      admin1: chosen.admin1,
      country: chosen.country,
      latitude: chosen.latitude,
      longitude: chosen.longitude,
    };

    const alreadySaved = state.cities.some(
      (saved) => saved.latitude === city.latitude && saved.longitude === city.longitude,
    );

    if (alreadySaved) {
      console.log(color.yellow(`\n${normalizeCityLabel(city)} ya está guardada.`));
      return;
    }

    state.cities.push(city);
    saveState(state);
    console.log(color.green(`\nCiudad agregada: ${normalizeCityLabel(city)}`));
  } catch (error) {
    console.log(color.red(`\nError al buscar la ciudad: ${error instanceof Error ? error.message : String(error)}`));
  }
}
