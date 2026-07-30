import { afterEach, describe, expect, mock, test, vi } from "bun:test";
import { freshImport } from "../helpers.ts";

afterEach(() => {
  mock.restore();
  vi.restoreAllMocks();
});

describe("city actions", () => {
  test("addCity rejects empty queries", async () => {
    const root = process.cwd();
    const inputMock = {
      ask: vi.fn(async () => "   "),
      pause: vi.fn(async () => undefined),
      chooseFromCities: vi.fn(),
      closePrompt: vi.fn(),
    };

    await mock.module(`${root}/src/presentation/input.ts`, () => ({
      ...inputMock,
    }));
    await mock.module(`${root}/src/api/geocoding.ts`, () => ({
      searchCities: vi.fn(),
    }));
    await mock.module(`${root}/src/storage/state.ts`, () => ({
      saveState: vi.fn(),
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
    const { addCity } = (await freshImport("../src/actions/addCity.ts")) as typeof import("../src/actions/addCity.ts");

    const state = { cities: [], defaultCityId: null, temperatureUnit: "celsius" as const };
    await addCity(state);

    expect(state.cities).toHaveLength(0);
    expect(logSpy.mock.calls.map((call) => call.join(" ")).join("\n")).toContain("Debes ingresar un nombre de ciudad");
  });

  test("addCity stores a city when a unique result is found", async () => {
    const root = process.cwd();
    const inputMock = {
      ask: vi.fn(async () => "Ottawa"),
      pause: vi.fn(async () => undefined),
      chooseFromCities: vi.fn(),
      closePrompt: vi.fn(),
    };

    const searchCities = vi.fn(async () => [
      {
        name: "Ottawa",
        admin1: "Ontario",
        country: "Canada",
        latitude: 45.41117,
        longitude: -75.69812,
      },
    ]);
    const saveState = vi.fn();

    await mock.module(`${root}/src/presentation/input.ts`, () => ({
      ...inputMock,
    }));
    await mock.module(`${root}/src/api/geocoding.ts`, () => ({
      searchCities,
    }));
    await mock.module(`${root}/src/storage/state.ts`, () => ({
      saveState,
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
    const { addCity } = (await freshImport("../src/actions/addCity.ts")) as typeof import("../src/actions/addCity.ts");

    const state = { cities: [], defaultCityId: null, temperatureUnit: "celsius" as const };
    await addCity(state);

    expect(searchCities).toHaveBeenCalledWith("Ottawa");
    expect(saveState).toHaveBeenCalledTimes(1);
    expect(state.cities).toHaveLength(1);
    expect(state.cities[0]).toMatchObject({
      name: "Ottawa",
      admin1: "Ontario",
      country: "Canada",
      latitude: 45.41117,
      longitude: -75.69812,
    });
    expect(logSpy.mock.calls.map((call) => call.join(" ")).join("\n")).toContain("Ciudad agregada: Ottawa, Ontario, Canada");
  });

  test("removeCity clears the default city when it is removed", async () => {
    const root = process.cwd();
    const chosenCity = {
      id: "city-1",
      name: "Ottawa",
      admin1: "Ontario",
      country: "Canada",
      latitude: 45.41117,
      longitude: -75.69812,
    };
    const saveState = vi.fn();
    const inputMock = {
      ask: vi.fn(async () => ""),
      pause: vi.fn(async () => undefined),
      chooseFromCities: vi.fn(async () => chosenCity),
      closePrompt: vi.fn(),
    };

    await mock.module(`${root}/src/presentation/input.ts`, () => ({
      ...inputMock,
    }));
    await mock.module(`${root}/src/storage/state.ts`, () => ({
      saveState,
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
    const { removeCity } = (await freshImport("../src/actions/removeCity.ts")) as typeof import("../src/actions/removeCity.ts");

    const state = { cities: [chosenCity], defaultCityId: "city-1", temperatureUnit: "celsius" as const };
    await removeCity(state);

    expect(state.cities).toEqual([]);
    expect(state.defaultCityId).toBeNull();
    expect(saveState).toHaveBeenCalledTimes(1);
    expect(logSpy.mock.calls.map((call) => call.join(" ")).join("\n")).toContain("Ciudad eliminada: Ottawa, Ontario, Canada");
  });

  test("setDefaultCity stores the selected city as default", async () => {
    const root = process.cwd();
    const chosenCity = {
      id: "city-2",
      name: "Montreal",
      admin1: "Quebec",
      country: "Canada",
      latitude: 45.5,
      longitude: -73.56,
    };
    const saveState = vi.fn();
    const inputMock = {
      ask: vi.fn(async () => ""),
      pause: vi.fn(async () => undefined),
      chooseFromCities: vi.fn(async () => chosenCity),
      closePrompt: vi.fn(),
    };

    await mock.module(`${root}/src/presentation/input.ts`, () => ({
      ...inputMock,
    }));
    await mock.module(`${root}/src/storage/state.ts`, () => ({
      saveState,
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
    const { setDefaultCity } = (await freshImport("../src/actions/setDefaultCity.ts")) as typeof import("../src/actions/setDefaultCity.ts");

    const state = { cities: [chosenCity], defaultCityId: null, temperatureUnit: "celsius" as const };
    await setDefaultCity(state);

    expect(state.defaultCityId).toBe("city-2");
    expect(saveState).toHaveBeenCalledTimes(1);
    expect(logSpy.mock.calls.map((call) => call.join(" ")).join("\n")).toContain("Ciudad default establecida: Montreal, Quebec, Canada");
  });

  test("listCities prints saved cities", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    const { listCities } = (await freshImport("../src/actions/listCities.ts")) as typeof import("../src/actions/listCities.ts");
    listCities({
      cities: [
        {
          id: "city-1",
          name: "Ottawa",
          admin1: "Ontario",
          country: "Canada",
          latitude: 45.41117,
          longitude: -75.69812,
        },
      ],
      defaultCityId: null,
      temperatureUnit: "celsius",
    });

    expect(logSpy.mock.calls.map((call) => call.join(" ")).join("\n")).toContain("1. Ottawa, Ontario, Canada");
  });
});
