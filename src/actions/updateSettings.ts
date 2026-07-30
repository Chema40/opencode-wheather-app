import type { AppState, TemperatureUnit } from "../types/weather.ts";
import { color } from "../utils/colors.ts";
import { saveState } from "../storage/state.ts";
import { ask } from "../presentation/input.ts";
import { unitSymbol } from "../utils/format.ts";

function isTemperatureUnit(value: string): value is TemperatureUnit {
  return value === "celsius" || value === "fahrenheit";
}

export async function updateSettings(state: AppState) {
  console.log(color.cyan(`\nUnidad actual: ${unitSymbol(state.temperatureUnit)}`));
  console.log("  1. Celsius");
  console.log("  2. Fahrenheit");

  const choice = (await ask("Selecciona una unidad: ")).trim();

  const nextUnit = choice === "1" ? "celsius" : choice === "2" ? "fahrenheit" : null;

  if (!nextUnit || !isTemperatureUnit(nextUnit)) {
    console.log(color.red("\nOpción inválida."));
    return;
  }

  state.temperatureUnit = nextUnit;
  saveState(state);
  console.log(color.green(`\nAjuste guardado: ${unitSymbol(state.temperatureUnit)}`));
}
