import { describe, expect, test } from "bun:test";
import { freshImport } from "../helpers.ts";

describe("format utils", () => {
  test("normalizes city labels", async () => {
    const { normalizeCityLabel } = (await freshImport("../src/utils/format.ts")) as typeof import("../src/utils/format.ts");

    expect(
      normalizeCityLabel({
        name: "Ottawa",
        admin1: "Ontario",
        country: "Canada",
      }),
    ).toBe("Ottawa, Ontario, Canada");
  });

  test("returns the right unit symbol", async () => {
    const { unitSymbol } = (await freshImport("../src/utils/format.ts")) as typeof import("../src/utils/format.ts");

    expect(unitSymbol("celsius")).toBe("°C");
    expect(unitSymbol("fahrenheit")).toBe("°F");
  });

  test("labels known and unknown weather codes", async () => {
    const { weatherLabel } = (await freshImport("../src/utils/format.ts")) as typeof import("../src/utils/format.ts");

    expect(weatherLabel(0)).toBe("Despejado");
    expect(weatherLabel(999)).toBe("Código 999");
    expect(weatherLabel()).toBe("Desconocido");
  });

  test("formats dates for current time and forecast day", async () => {
    const { formatCurrentTime, formatForecastDay } = (await freshImport("../src/utils/format.ts")) as typeof import("../src/utils/format.ts");
    const currentTime = "2024-01-02T03:04:00.000Z";
    const forecastDay = "2024-01-03";

    expect(formatCurrentTime(currentTime)).toBe(
      new Intl.DateTimeFormat("es-ES", { dateStyle: "medium", timeStyle: "short" }).format(new Date(currentTime)),
    );
    expect(formatCurrentTime()).toBe("No disponible");
    expect(formatCurrentTime("not-a-date")).toBe("not-a-date");

    expect(formatForecastDay(forecastDay)).toBe(
      new Intl.DateTimeFormat("es-ES", { weekday: "short", day: "2-digit", month: "short", timeZone: "UTC" }).format(
        new Date(forecastDay),
      ),
    );
    expect(formatForecastDay()).toBe("Fecha no disponible");
    expect(formatForecastDay("bad-date")).toBe("bad-date");
  });
});
