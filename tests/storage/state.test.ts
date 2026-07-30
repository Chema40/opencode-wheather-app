import { describe, expect, test } from "bun:test";
import { freshImport, withTempCwd } from "../helpers.ts";

describe("state storage", () => {
  test("loads the default state when the file does not exist", async () => {
    await withTempCwd(async () => {
      const { loadState } = (await freshImport("../src/storage/state.ts")) as typeof import("../src/storage/state.ts");

      expect(loadState()).toEqual({
        cities: [],
        defaultCityId: null,
        temperatureUnit: "celsius",
      });
    });
  });

  test("loads and sanitizes persisted state", async () => {
    await withTempCwd(async (cwd) => {
      await Bun.write(
        `${cwd}/.weather-cli-state.json`,
        JSON.stringify(
          {
            cities: [
              {
                id: "city-1",
                name: "Ottawa",
                admin1: "Ontario",
                country: "Canada",
                latitude: 45.41,
                longitude: -75.69,
              },
              {
                id: 1,
                name: "Invalid",
                latitude: "bad",
              },
            ],
            defaultCityId: "city-1",
            temperatureUnit: "fahrenheit",
          },
          null,
          2,
        ),
      );

      const { loadState } = (await freshImport("../src/storage/state.ts")) as typeof import("../src/storage/state.ts");

      expect(loadState()).toEqual({
        cities: [
          {
            id: "city-1",
            name: "Ottawa",
            admin1: "Ontario",
            country: "Canada",
            latitude: 45.41,
            longitude: -75.69,
          },
        ],
        defaultCityId: "city-1",
        temperatureUnit: "fahrenheit",
      });
    });
  });

  test("falls back to the default state for invalid JSON", async () => {
    await withTempCwd(async (cwd) => {
      await Bun.write(`${cwd}/.weather-cli-state.json`, "not-json");

      const { loadState } = (await freshImport("../src/storage/state.ts")) as typeof import("../src/storage/state.ts");

      expect(loadState()).toEqual({
        cities: [],
        defaultCityId: null,
        temperatureUnit: "celsius",
      });
    });
  });

  test("writes the state file", async () => {
    await withTempCwd(async (cwd) => {
      const { saveState } = (await freshImport("../src/storage/state.ts")) as typeof import("../src/storage/state.ts");

      const nextState = {
        cities: [],
        defaultCityId: null,
        temperatureUnit: "celsius" as const,
      };

      saveState(nextState);

      expect(await Bun.file(`${cwd}/.weather-cli-state.json`).text()).toBe(`${JSON.stringify(nextState, null, 2)}\n`);
    });
  });
});
