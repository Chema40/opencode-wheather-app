import { afterEach, describe, expect, test, vi } from "bun:test";
import { freshImport } from "../helpers.ts";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("geocoding api", () => {
  test("searches cities and returns results", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    fetchSpy.mockImplementation(async () =>
      ({
        ok: true,
        json: async () => ({
          results: [
            {
              name: "Ottawa",
              admin1: "Ontario",
              country: "Canada",
              latitude: 45.41117,
              longitude: -75.69812,
            },
          ],
        }),
      }) as Response,
    );

    const { searchCities } = (await freshImport("../src/api/geocoding.ts")) as typeof import("../src/api/geocoding.ts");

    await expect(searchCities("Ottawa")).resolves.toEqual([
      {
        name: "Ottawa",
        admin1: "Ontario",
        country: "Canada",
        latitude: 45.41117,
        longitude: -75.69812,
      },
    ]);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  test("returns an empty array when the API response has no results", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    fetchSpy.mockImplementation(async () => ({ ok: true, json: async () => ({}) }) as Response);

    const { searchCities } = (await freshImport("../src/api/geocoding.ts")) as typeof import("../src/api/geocoding.ts");

    await expect(searchCities("Nowhere")).resolves.toEqual([]);
  });

  test("throws on non-ok responses", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async () => ({ ok: false, status: 500, json: async () => ({}) }) as Response);

    const { searchCities } = (await freshImport("../src/api/geocoding.ts")) as typeof import("../src/api/geocoding.ts");

    await expect(searchCities("Ottawa")).rejects.toThrow(/HTTP 500/);
  });
});
