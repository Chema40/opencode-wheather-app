import type { AppState, DailyWeather, TemperatureUnit } from "../types/weather.ts";
import { color } from "../utils/colors.ts";
import { formatForecastDay, normalizeCityLabel, unitSymbol, weatherLabel } from "../utils/format.ts";

export function printMenu(state: AppState) {
  console.clear();
  console.log(color.cyan("════════════════════════════════════════"));
  console.log(color.cyan("         WEATHER CLI"));
  console.log(color.cyan("════════════════════════════════════════"));
  console.log(color.cyan(`  Ciudades guardadas: ${state.cities.length}`));
  console.log(color.cyan(`  Ajustes (${unitSymbol(state.temperatureUnit)})`));
  console.log(color.cyan("  1. Clima de ciudad default"));
  console.log(color.cyan(`  2. Clima y pronóstico de todas las ciudades (${state.cities.length})`));
  console.log(color.cyan("  3. Buscar y agregar ciudad"));
  console.log(color.cyan("  4. Eliminar ciudad"));
  console.log(color.cyan("  5. Establecer ciudad default"));
  console.log(color.cyan("  8. Ajustes"));
  console.log(color.cyan("  9. Salir"));
  console.log(color.cyan("════════════════════════════════════════"));
}

export function showForecast(daily: DailyWeather, unit: TemperatureUnit) {
  const days = daily.time ?? [];

  if (days.length === 0) {
    console.log(color.yellow("  Pronóstico de 7 días no disponible."));
    return;
  }

  console.log(color.cyan("  Pronóstico de 7 días:"));

  days.slice(0, 7).forEach((day, index) => {
    const min = daily.temperature_2m_min?.[index];
    const max = daily.temperature_2m_max?.[index];
    const precipitation = daily.precipitation_sum?.[index];
    const wind = daily.wind_speed_10m_max?.[index];
    const code = daily.weather_code?.[index];

    console.log(
      `    ${formatForecastDay(day)}: ${weatherLabel(code)} | ${min ?? "N/D"}${unitSymbol(unit)} / ${max ?? "N/D"}${unitSymbol(unit)} | Lluvia: ${precipitation ?? "N/D"} mm | Viento: ${wind ?? "N/D"} km/h`,
    );
  });
}

export function showCityHeader(city: Parameters<typeof normalizeCityLabel>[0]) {
  console.log(`\n${normalizeCityLabel(city)}`);
}
