import { afterEach, describe, expect, test, vi } from "bun:test";
import { freshImport } from "../helpers.ts";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("weather api", () => {
  test("builds the forecast url without daily data", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    fetchSpy.mockImplementation(async (input) => {
      const url = new URL(String(input));

      expect(url.hostname).toBe("api.open-meteo.com");
      expect(url.searchParams.get("latitude")).toBe("45.41117");
      expect(url.searchParams.get("longitude")).toBe("-75.69812");
      expect(url.searchParams.get("current")).toBe(
        "temperature_2m,apparent_temperature,wind_speed_10m,weather_code,is_day",
      );
      expect(url.searchParams.get("temperature_unit")).toBe("celsius");
      expect(url.searchParams.has("daily")).toBe(false);

      return {
        ok: true,
        json: async () => ({ current: { temperature_2m: 10 } }),
      } as Response;
    });

    const { fetchForecast } = (await freshImport("../src/api/weather.ts")) as typeof import("../src/api/weather.ts");

    await expect(
      fetchForecast(
        {
          id: "city-1",
          name: "Ottawa",
          latitude: 45.41117,
          longitude: -75.69812,
        },
        "celsius",
      ),
    ).resolves.toEqual({ current: { temperature_2m: 10 } });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  test("includes daily data when requested", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = new URL(String(input));

      expect(url.searchParams.get("daily")).toBe(
        "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max",
      );
      expect(url.searchParams.get("forecast_days")).toBe("7");

      return {
        ok: true,
        json: async () => ({
          current: { temperature_2m: 21 },
          daily: { time: ["2024-01-01"] },
        }),
      } as Response;
    });

    const { fetchForecast } = (await freshImport("../src/api/weather.ts")) as typeof import("../src/api/weather.ts");

    await expect(
      fetchForecast(
        {
          id: "city-1",
          name: "Ottawa",
          latitude: 45.41117,
          longitude: -75.69812,
        },
        "fahrenheit",
        true,
      ),
    ).resolves.toEqual({ current: { temperature_2m: 21 }, daily: { time: ["2024-01-01"] } });
  });

  test("throws on bad responses", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async () => ({ ok: false, status: 503, json: async () => ({}) }) as Response);

    const { fetchForecast } = (await freshImport("../src/api/weather.ts")) as typeof import("../src/api/weather.ts");

    await expect(
      fetchForecast(
        {
          id: "city-1",
          name: "Ottawa",
          latitude: 45.41117,
          longitude: -75.69812,
        },
        "celsius",
      ),
    ).rejects.toThrow(/HTTP 503/);
  });
});
