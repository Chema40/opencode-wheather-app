import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import type { CityRecord } from "../types/weather.ts";
import { normalizeCityLabel } from "../utils/format.ts";

const rl = createInterface({ input, output });

export async function ask(question: string) {
  return rl.question(question);
}

export async function pause() {
  await ask("\nPresiona Enter para continuar...");
}

export async function chooseFromCities(cities: CityRecord[], promptLabel = "Selecciona una ciudad") {
  if (cities.length === 0) {
    return null;
  }

  if (cities.length === 1) {
    return cities[0] ?? null;
  }

  console.log("\nCiudades disponibles:");
  cities.forEach((city, index) => {
    console.log(`  ${index + 1}. ${normalizeCityLabel(city)}`);
  });

  const answer = Number.parseInt(await ask(`${promptLabel}: `), 10);
  if (!Number.isInteger(answer) || answer < 1 || answer > cities.length) {
    return null;
  }

  return cities[answer - 1] ?? null;
}

export function closePrompt() {
  rl.close();
}
