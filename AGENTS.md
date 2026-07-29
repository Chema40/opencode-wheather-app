# AGENTS.md

- Repo is a tiny Bun + TypeScript CLI scaffold.
- Current runtime entrypoint is `index.ts`; it only prints `Hello via Bun!` right now.
- `README.md` describes a weather CLI goal, but the implementation is not there yet.
- `package.json` has `build`, `start`, and `dev` scripts; `bun run build` compiles a native `./weather` binary.
- Use Bun directly for setup/run work; install deps with `bun install`.
- Run the CLI with `bun index.ts` or `bun run start`.
- TypeScript is strict and emits nothing: `noEmit`, `strict`, `moduleResolution: "bundler"`, `verbatimModuleSyntax`, `allowImportingTsExtensions`, `allowJs`.
- `noUnusedLocals` and `noUnusedParameters` are disabled, so unused bindings do not fail typecheck here.
- Git ignores `dist/`, `out/`, `coverage/`, `*.tsbuildinfo`, and `.env*`; do not rely on those being committed.
- The CLI persists cities and the default city in `.weather-cli-state.json`, which is gitignored.
