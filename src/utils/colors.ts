const shouldUseColors =
  process.env.NO_COLOR !== "1" && (Boolean(process.stdout.isTTY) || process.env.FORCE_COLOR === "1");

export const color = {
  cyan(text: string) {
    return shouldUseColors ? `\u001b[36m${text}\u001b[0m` : text;
  },
  yellow(text: string) {
    return shouldUseColors ? `\u001b[33m${text}\u001b[0m` : text;
  },
  green(text: string) {
    return shouldUseColors ? `\u001b[32m${text}\u001b[0m` : text;
  },
  red(text: string) {
    return shouldUseColors ? `\u001b[31m${text}\u001b[0m` : text;
  },
};
