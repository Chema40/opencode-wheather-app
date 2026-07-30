export async function freshImport<T = unknown>(specifier: string): Promise<T> {
  return (await import(`${specifier}?t=${crypto.randomUUID()}`)) as T;
}

export async function withTempCwd<T>(fn: (cwd: string) => Promise<T>): Promise<T> {
  const { mkdtemp, rm } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");

  const originalCwd = process.cwd();
  const cwd = await mkdtemp(join(tmpdir(), "weather-cli-tests-"));

  process.chdir(cwd);

  try {
    return await fn(cwd);
  } finally {
    process.chdir(originalCwd);
    await rm(cwd, { recursive: true, force: true });
  }
}

export function setStdoutIsTTY(value: boolean | undefined) {
  Object.defineProperty(process.stdout, "isTTY", {
    value,
    configurable: true,
  });
}
