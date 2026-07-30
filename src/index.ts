import { loadState } from "./storage/state.ts";
import { ask, closePrompt, pause } from "./presentation/input.ts";
import { printMenu } from "./presentation/output.ts";
import { color } from "./utils/colors.ts";
import { addCity } from "./actions/addCity.ts";
import { removeCity } from "./actions/removeCity.ts";
import { setDefaultCity } from "./actions/setDefaultCity.ts";
import { showAllCitiesWeather, showDefaultCityWeather } from "./actions/getWeather.ts";
import { updateSettings } from "./actions/updateSettings.ts";

async function main() {
  const state = loadState();

  try {
    while (true) {
      printMenu(state);
      const choice = (await ask("  Selecciona una opción: ")).trim();

      if (choice === "1") {
        await showDefaultCityWeather(state);
      } else if (choice === "2") {
        await showAllCitiesWeather(state);
      } else if (choice === "3") {
        await addCity(state);
      } else if (choice === "4") {
        await removeCity(state);
      } else if (choice === "5") {
        await setDefaultCity(state);
      } else if (choice === "8") {
        await updateSettings(state);
      } else if (choice === "9") {
        console.log(color.cyan("\nHasta luego."));
        break;
      } else {
        console.log(color.red("\nOpción inválida."));
      }

      await pause();
    }
  } finally {
    closePrompt();
  }
}

await main();
