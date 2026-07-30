import { afterEach, describe, expect, mock, test, vi } from "bun:test";
import { freshImport } from "../helpers.ts";

afterEach(() => {
  mock.restore();
  vi.restoreAllMocks();
});

describe("weather actions", () => {
  test("showDefaultCityWeather reports when there is no default city", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    const { showDefaultCityWeather } = (await freshImport("../src/actions/getWeather.ts")) as typeof import("../src/actions/getWeather.ts");

    await showDefaultCityWeather({ cities: [], defaultCityId: null, temperatureUnit: "celsius" });

    expect(logSpy.mock.calls.map((call) => call.join(" ")).join("\n")).toContain("No hay ciudad default configurada");
  });

  test("showWeather prints the current weather", async () => {
    const root = process.cwd();
    const fetchForecast = vi.fn(async () => ({
      current: {
        temperature_2m: 18,
        apparent_temperature: 17,
        wind_speed_10m: 11,
        weather_code: 0,
        time: "2024-01-02T03:04:00.000Z",
      },
    }));

    await mock.module(`${root}/src/api/weather.ts`, () => ({
      fetchForecast,
    }));
    await mock.module(`${root}/src/utils/colors.ts`, () => ({
      color: {
        cyan: (text: string) => text,
        yellow: (text: string) => text,
        green: (text: string) => text,
        red: (text: string) => text,
      },
    }));

    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const { showWeather } = (await freshImport("../src/actions/getWeather.ts")) as typeof import("../src/actions/getWeather.ts");

    await showWeather(
      {
        id: "city-1",
        name: "Ottawa",
        admin1: "Ontario",
        country: "Canada",
        latitude: 45.41117,
        longitude: -75.69812,
      },
      { cities: [], defaultCityId: null, temperatureUnit: "celsius" },
    );

    expect(fetchForecast).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Ottawa" }),
      "celsius",
      false,
    );
    expect(logSpy.mock.calls.map((call) => call.join(" ")).join("\n")).toContain("Temperatura:");
    expect(logSpy.mock.calls.map((call) => call.join(" ")).join("\n")).toContain("Estado: Despejado");
  });

  test("showAllCitiesWeather stops on empty city lists", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    const { showAllCitiesWeather } = (await freshImport("../src/actions/getWeather.ts")) as typeof import("../src/actions/getWeather.ts");

    await showAllCitiesWeather({ cities: [], defaultCityId: null, temperatureUnit: "celsius" });

    expect(logSpy.mock.calls.map((call) => call.join(" ")).join("\n")).toContain("No hay ciudades guardadas");
  });
});
