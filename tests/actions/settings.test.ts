import { afterEach, describe, expect, mock, test, vi } from "bun:test";
import { freshImport } from "../helpers.ts";

afterEach(() => {
  mock.restore();
  vi.restoreAllMocks();
});

describe("settings action", () => {
  test("rejects invalid selections", async () => {
    const root = process.cwd();

    await mock.module(`${root}/src/presentation/input.ts`, () => ({
      ask: vi.fn(async () => "9"),
      pause: vi.fn(async () => undefined),
      chooseFromCities: vi.fn(),
      closePrompt: vi.fn(),
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
    const { updateSettings } = (await freshImport("../src/actions/updateSettings.ts")) as typeof import("../src/actions/updateSettings.ts");

    const state = { cities: [], defaultCityId: null, temperatureUnit: "celsius" as const };
    await updateSettings(state);

    expect(state.temperatureUnit).toBe("celsius");
    expect(logSpy.mock.calls.map((call) => call.join(" ")).join("\n")).toContain("Opción inválida");
  });

  test("updates the temperature unit", async () => {
    const root = process.cwd();

    const saveState = vi.fn();

    await mock.module(`${root}/src/presentation/input.ts`, () => ({
      ask: vi.fn(async () => "2"),
      pause: vi.fn(async () => undefined),
      chooseFromCities: vi.fn(),
      closePrompt: vi.fn(),
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
    const { updateSettings } = (await freshImport("../src/actions/updateSettings.ts")) as typeof import("../src/actions/updateSettings.ts");

    const state = { cities: [], defaultCityId: null, temperatureUnit: "celsius" as const };
    await updateSettings(state);

    expect(state.temperatureUnit).toBe("fahrenheit");
    expect(saveState).toHaveBeenCalledTimes(1);
    expect(logSpy.mock.calls.map((call) => call.join(" ")).join("\n")).toContain("Ajuste guardado");
  });
});
