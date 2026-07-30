import type { AppState, CityRecord } from "../types/weather.ts";
import { color } from "../utils/colors.ts";
import { formatCurrentTime, normalizeCityLabel, unitSymbol, weatherLabel } from "../utils/format.ts";
import { fetchForecast } from "../api/weather.ts";
import { showCityHeader, showForecast } from "../presentation/output.ts";

function findDefaultCity(state: AppState) {
  return state.defaultCityId ? state.cities.find((city) => city.id === state.defaultCityId) ?? null : null;
}

export async function showWeather(city: CityRecord, state: AppState, includeForecast = false) {
  showCityHeader(city);

  try {
    const forecast = await fetchForecast(city, state.temperatureUnit, includeForecast);
    const current = forecast.current ?? null;

    if (!current) {
      console.log(color.red("  No se pudo obtener el clima actual."));
      return;
    }

    console.log(
      `  Temperatura: ${color.yellow(`${current.temperature_2m ?? "N/D"} ${unitSymbol(state.temperatureUnit)}`)}`,
    );
    console.log(
      `  Sensación térmica: ${current.apparent_temperature ?? "N/D"} ${unitSymbol(state.temperatureUnit)}`,
    );
    console.log(`  Viento: ${current.wind_speed_10m ?? "N/D"} km/h`);
    console.log(`  Estado: ${weatherLabel(current.weather_code)}`);
    console.log(`  Hora: ${formatCurrentTime(current.time)}`);
    if (includeForecast) {
      if (forecast.daily) {
        showForecast(forecast.daily, state.temperatureUnit);
      } else {
        console.log(color.yellow("  Pronóstico de 7 días no disponible."));
      }
    }
    console.log(color.green("  OK"));
  } catch (error) {
    console.log(color.red(`  Error: ${error instanceof Error ? error.message : String(error)}`));
  }
}

export async function showDefaultCityWeather(state: AppState) {
  const city = findDefaultCity(state);

  if (!city) {
    console.log("\nNo hay ciudad default configurada.");
    return;
  }

  await showWeather(city, state);
}

export async function showAllCitiesWeather(state: AppState) {
  if (state.cities.length === 0) {
    console.log("\nNo hay ciudades guardadas.");
    return;
  }

  for (const city of state.cities) {
    await showWeather(city, state, true);
  }
}

export function getDefaultCity(state: AppState) {
  return findDefaultCity(state);
}
