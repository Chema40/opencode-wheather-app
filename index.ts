import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { join } from "node:path";

type TemperatureUnit = "celsius" | "fahrenheit";

type CityRecord = {
  id: string;
  name: string;
  admin1?: string;
  country?: string;
  latitude: number;
  longitude: number;
};

type AppState = {
  cities: CityRecord[];
  defaultCityId: string | null;
  temperatureUnit: TemperatureUnit;
};

type GeocodingResult = {
  name: string;
  admin1?: string;
  country?: string;
  latitude: number;
  longitude: number;
};

type GeocodingResponse = {
  results?: GeocodingResult[];
};

type CurrentWeather = {
  temperature_2m?: number;
  apparent_temperature?: number;
  wind_speed_10m?: number;
  weather_code?: number;
  is_day?: 0 | 1;
  time?: string;
};

type ForecastResponse = {
  current?: CurrentWeather;
};

const STATE_FILE = join(process.cwd(), ".weather-cli-state.json");
const DEFAULT_STATE: AppState = {
  cities: [],
  defaultCityId: null,
  temperatureUnit: "celsius",
};

const WEATHER_CODES: Record<number, string> = {
  0: "Despejado",
  1: "Mayormente despejado",
  2: "Parcialmente nublado",
  3: "Nublado",
  45: "Niebla",
  48: "Niebla con escarcha",
  51: "Llovizna ligera",
  53: "Llovizna moderada",
  55: "Llovizna intensa",
  61: "Lluvia ligera",
  63: "Lluvia moderada",
  65: "Lluvia intensa",
  71: "Nieve ligera",
  73: "Nieve moderada",
  75: "Nieve intensa",
  80: "Chubascos ligeros",
  81: "Chubascos moderados",
  82: "Chubascos intensos",
  95: "Tormenta",
  96: "Tormenta con granizo",
  99: "Tormenta fuerte con granizo",
};

const rl = createInterface({ input, output });

function normalizeCityLabel(city: Pick<CityRecord, "name" | "admin1" | "country">) {
  return [city.name, city.admin1, city.country].filter(Boolean).join(", ");
}

function unitSymbol(unit: TemperatureUnit) {
  return unit === "celsius" ? "°C" : "°F";
}

function weatherLabel(code?: number) {
  if (typeof code !== "number") {
    return "Desconocido";
  }

  return WEATHER_CODES[code] ?? `Código ${code}`;
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function isTemperatureUnit(value: unknown): value is TemperatureUnit {
  return value === "celsius" || value === "fahrenheit";
}

function loadState(): AppState {
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

function saveState(state: AppState) {
  writeFileSync(STATE_FILE, `${JSON.stringify(state, null, 2)}\n`, "utf8");
}

async function ask(question: string) {
  return rl.question(question);
}

async function pause() {
  await ask("\nPresiona Enter para continuar...");
}

function printMenu(state: AppState) {
  console.clear();
  console.log("════════════════════════════════════════");
  console.log("         WEATHER CLI");
  console.log("════════════════════════════════════════");
  console.log(`  Ciudades guardadas: ${state.cities.length}`);
  console.log(`  Ajustes (${unitSymbol(state.temperatureUnit)})`);
  console.log("  1. Clima de ciudad default");
  console.log(`  2. Clima de todas las ciudades (${state.cities.length})`);
  console.log("  3. Buscar y agregar ciudad");
  console.log("  4. Eliminar ciudad");
  console.log("  5. Establecer ciudad default");
  console.log("  8. Ajustes");
  console.log("  9. Salir");
  console.log("════════════════════════════════════════");
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} al consultar ${url}`);
  }

  return (await response.json()) as T;
}

async function searchCities(name: string) {
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

async function fetchWeather(city: CityRecord, unit: TemperatureUnit) {
  const params = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    current: "temperature_2m,apparent_temperature,wind_speed_10m,weather_code,is_day",
    timezone: "auto",
    temperature_unit: unit,
  });

  const data = await fetchJson<ForecastResponse>(
    `https://api.open-meteo.com/v1/forecast?${params}`,
  );

  return data.current ?? null;
}

function formatCurrentTime(time?: string) {
  if (!time) {
    return "No disponible";
  }

  const date = new Date(time);

  if (Number.isNaN(date.getTime())) {
    return time;
  }

  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

async function showWeather(city: CityRecord, state: AppState) {
  console.log(`\n${normalizeCityLabel(city)}`);

  try {
    const current = await fetchWeather(city, state.temperatureUnit);

    if (!current) {
      console.log("  No se pudo obtener el clima actual.");
      return;
    }

    console.log(`  Temperatura: ${current.temperature_2m ?? "N/D"} ${unitSymbol(state.temperatureUnit)}`);
    console.log(
      `  Sensación térmica: ${current.apparent_temperature ?? "N/D"} ${unitSymbol(state.temperatureUnit)}`,
    );
    console.log(`  Viento: ${current.wind_speed_10m ?? "N/D"} km/h`);
    console.log(`  Estado: ${weatherLabel(current.weather_code)}`);
    console.log(`  Hora: ${formatCurrentTime(current.time)}`);
  } catch (error) {
    console.log(`  Error: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function findDefaultCity(state: AppState) {
  return state.defaultCityId ? state.cities.find((city) => city.id === state.defaultCityId) ?? null : null;
}

async function chooseFromCities(cities: CityRecord[], promptLabel = "Selecciona una ciudad") {
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

async function showDefaultCityWeather(state: AppState) {
  const city = findDefaultCity(state);

  if (!city) {
    console.log("\nNo hay ciudad default configurada.");
    return;
  }

  await showWeather(city, state);
}

async function showAllCitiesWeather(state: AppState) {
  if (state.cities.length === 0) {
    console.log("\nNo hay ciudades guardadas.");
    return;
  }

  for (const city of state.cities) {
    await showWeather(city, state);
  }
}

async function addCity(state: AppState) {
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
      console.log(`\n${normalizeCityLabel(city)} ya está guardada.`);
      return;
    }

    state.cities.push(city);
    saveState(state);
    console.log(`\nCiudad agregada: ${normalizeCityLabel(city)}`);
  } catch (error) {
    console.log(`\nError al buscar la ciudad: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function removeCity(state: AppState) {
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
  console.log(`\nCiudad eliminada: ${normalizeCityLabel(chosen)}`);
}

async function setDefaultCity(state: AppState) {
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
  console.log(`\nCiudad default establecida: ${normalizeCityLabel(chosen)}`);
}

async function updateSettings(state: AppState) {
  console.log(`\nUnidad actual: ${unitSymbol(state.temperatureUnit)}`);
  console.log("  1. Celsius");
  console.log("  2. Fahrenheit");

  const choice = (await ask("Selecciona una unidad: ")).trim();

  if (choice === "1") {
    state.temperatureUnit = "celsius";
  } else if (choice === "2") {
    state.temperatureUnit = "fahrenheit";
  } else {
    console.log("\nOpción inválida.");
    return;
  }

  saveState(state);
  console.log(`\nAjuste guardado: ${unitSymbol(state.temperatureUnit)}`);
}

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
        console.log("\nHasta luego.");
        break;
      } else {
        console.log("\nOpción inválida.");
      }

      await pause();
    }
  } finally {
    rl.close();
  }
}

await main();
