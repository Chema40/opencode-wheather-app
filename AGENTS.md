# AGENTS.md

- Repo is a tiny Bun + TypeScript CLI scaffold.
- Current runtime entrypoint is `index.ts`; it only prints `Hello via Bun!` right now.
- `README.md` describes a weather CLI goal, but the implementation is not there yet.
- There are no `package.json` scripts, CI workflows, or repo-local OpenCode rules in this repo.
- Use Bun directly for setup/run work; install deps with `bun install`.
- TypeScript is strict and emits nothing: `noEmit`, `strict`, `moduleResolution: "bundler"`, `verbatimModuleSyntax`, `allowImportingTsExtensions`, `allowJs`.
- `noUnusedLocals` and `noUnusedParameters` are disabled, so unused bindings do not fail typecheck here.
- Git ignores `dist/`, `out/`, `coverage/`, `*.tsbuildinfo`, and `.env*`; do not rely on those being committed.
