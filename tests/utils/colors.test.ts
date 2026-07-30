import { afterEach, describe, expect, test } from "bun:test";
import { freshImport, setStdoutIsTTY } from "../helpers.ts";

const originalEnv = {
  NO_COLOR: process.env.NO_COLOR,
  FORCE_COLOR: process.env.FORCE_COLOR,
};

afterEach(() => {
  if (originalEnv.NO_COLOR === undefined) {
    delete process.env.NO_COLOR;
  } else {
    process.env.NO_COLOR = originalEnv.NO_COLOR;
  }

  if (originalEnv.FORCE_COLOR === undefined) {
    delete process.env.FORCE_COLOR;
  } else {
    process.env.FORCE_COLOR = originalEnv.FORCE_COLOR;
  }

  setStdoutIsTTY(undefined);
});

describe("colors", () => {
  test("wraps text when colors are enabled", async () => {
    delete process.env.NO_COLOR;
    process.env.FORCE_COLOR = "1";
    setStdoutIsTTY(true);

    const { color } = (await freshImport("../src/utils/colors.ts")) as typeof import("../src/utils/colors.ts");

    expect(color.cyan("menu")).toBe("\u001b[36mmenu\u001b[0m");
    expect(color.yellow("temp")).toBe("\u001b[33mtemp\u001b[0m");
    expect(color.green("ok")).toBe("\u001b[32mok\u001b[0m");
    expect(color.red("error")).toBe("\u001b[31merror\u001b[0m");
  });

  test("returns plain text when NO_COLOR is set", async () => {
    process.env.NO_COLOR = "1";
    setStdoutIsTTY(true);

    const { color } = (await freshImport("../src/utils/colors.ts")) as typeof import("../src/utils/colors.ts");

    expect(color.cyan("menu")).toBe("menu");
    expect(color.yellow("temp")).toBe("temp");
    expect(color.green("ok")).toBe("ok");
    expect(color.red("error")).toBe("error");
  });
});
