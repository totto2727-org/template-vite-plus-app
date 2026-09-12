# username/project

## Repository structure

```text
src/main.ts         Bun CLI entrypoint and console output
src/greet.ts        Pure greeting behavior
src/greet.test.ts   Vite+ unit tests
vite.config.ts     Vite+ formatter, linter, type checks, tests, and tasks
package.json       Private package, Bun bin script, and portable npm launcher
pnpm-lock.yaml     Vite+ development dependency lock
bun.lock           Bun dependency lock for Nix packaging
bun.nix            Generated bun2nix dependency sources
flake.nix          Development shell, compiled package, and standalone overlay
package.nix        bun2nix compile package installed as bin/project
```

## Development commands

### Execution rules

- Run commands from the repository root inside `nix develop`.
- Use Vite+ for both formatting and linting, as well as type checking and tests.
- Use Bun for source execution and native compilation, not for formatting, linting, or tests.
- Keep Nix package build validation separate from source tasks and regular CI.
- Keep `AGENTS.md` canonical and do not create `CLAUDE.md`.

### Standard tasks

- `nix develop`: Enter the pinned Node.js, Bun, Vite+, bun2nix, and nixfmt environment.
- `vp install --frozen-lockfile`: Install locked development dependencies.
- `vp run bin`: Run the CLI using `bun run src/main.ts`.
- `vp run fix`: Apply Vite+ formatting and supported lint fixes with `vp check --fix`.
- `vp run check`: Check formatting, lint, and TypeScript types through the cached `vp check` task.
- `vp run test`: Run tests once through the cached `vp test run` task.
- `vp run build`: Run `bun build --compile src/main.ts --outfile build/project` for the current OS and CPU.
- `vp run pack`: Build the portable Bun-shebang npm launcher with `vp pack` into `dist/main.mjs`, separate from the native executable.
- `vp run npm:check`: Build `pack` first, then inspect npm package contents with `npm pack --dry-run`.
- `vp run ci`: Schedule independent checks, tests, native compilation, and portable packaging in parallel. npm verification depends on packaging. Do not execute the application in regular CI.
- `vp run --verbose --log labeled ci`: Inspect dependency scheduling and cache hit/miss reasons. Put runner flags before the task name.
- `env -i PATH= "$PWD/build/project"`: Separately validate the compiled executable without Bun or Node.js on PATH after building. Expect `Hello, world!` and exit status 0.
- `vp install`: Update the Vite+ dependency lock after manifest changes.
- `bun install --lockfile-only --ignore-scripts`: Refresh the Bun lock from the same manifest for Nix packaging without replacing the Vite+ installation.
- `bun2nix -o bun.nix`: Regenerate Nix dependency sources after updating `bun.lock`.
- `npm pack --pack-destination tmp`: Create an actual npm archive for optional local installed-CLI validation after `vp run pack`. Keep it out of commits.
- `nixfmt flake.nix package.nix`: Format maintained Nix expressions.
- `nix eval .#packages.aarch64-darwin.default.drvPath`: Optionally evaluate the package derivation without building it. Substitute another supported system as needed.
- `nix build .#project`: Optionally build the Nix package when explicitly needed, never as a regular CI requirement.

## Architecture

### CLI and distribution

- Keep process I/O in `src/main.ts` and greeting behavior in the pure module.
- `build/project` is a single native executable containing Bun, not a JavaScript bundle or source wrapper. `dist/main.mjs` is the separate portable npm launcher and retains `#!/usr/bin/env bun`.
- Native executables target the build host's OS and CPU. Cross-platform release artifacts require an explicit distribution design.
- Node.js supports Vite+ and npm acquisition tools. The native CLI needs no runtime on PATH, while the npm CLI requires Bun. The packer's Node-compatible platform setting does not change the launcher to Node.js.
- `package.nix` uses `bun2nix.mkDerivation` and `fetchBunDeps` to compile the same entrypoint and install `$out/bin/project`.
- The bun2nix builder disables its normal binary fixup by default to avoid corrupting the embedded runtime. Preserve that behavior when customizing phases.
- `bunCompileToBytecode = false` avoids adding CommonJS bytecode semantics. Build flags match the local compile command without automatic minification or sourcemaps.

## Development tools

- **Nix inputs**: `bun2nix.follows = "vite-plus-overlay/bun2nix"` reuses the builder already pinned transitively by the Vite+ overlay. The exported project overlay injects that builder itself and does not require consumers to add a second overlay.
- **Dependency locks**: `pnpm-lock.yaml` owns the Vite+ development installation. `bun.lock` and generated `bun.nix` supply the same manifest's dependencies to Nix. Update and review all three together after dependency changes.
- **Vite+**: The globally pinned `vp` CLI and the local `vite-plus` dependency are independently versioned. Formatting retains no semicolons, single quotes, width 120, and unwrapped Markdown prose.
- **TypeScript**: Extend the exact `@tsconfig/strictest` and `@tsconfig/node-ts` presets in that order. Inherit strictness, erasable syntax, relative TypeScript import rewriting, and verbatim modules without duplicating or weakening them locally. Only ESNext targeting, NodeNext modules, no-emit, and Node types are local. NodeNext supplies module resolution, and import rewriting permits `.ts` import paths without a separate `allowImportingTsExtensions` override. Use default file discovery without custom `include`, `files`, or `exclude` lists.
- **Task cache**: All configured tasks use Vite+'s default caching. `ci` is an empty command with dependency edges, not shell orchestration. Native outputs are explicitly archived from `build/**` and excluded from automatic inputs. `pack` archives `dist/**`. Use `vp run --last-details` to inspect replay and invalidation behavior.
- **Fix task**: Keep default caching for `vp check --fix`. Vite+ detects read-and-write inputs and declines unsafe cache entries when it changes source files. Reintroducing malformed source must still be corrected.
- **GitHub Actions**: CI uses shared `setup-nix@main` and `setup-typescript@main`, then evaluates `eval "$(nix print-dev-env "$GITHUB_WORKSPACE#default")"` before `vp run ci`. Keep shared org references on `@main`. Do not add a start/smoke task or `nix build` to regular CI.

## Package-specific rules

- Keep npm publication disabled with `private: true` and the disabled publishing workflow until registry ownership and repository-linked OIDC trust are configured. The portable Bun launcher lives only in `dist/`, and the npm `files` allowlist must never include native `build/` output.
- Nix dependency installation uses the frozen Bun lock and disables lifecycle scripts. Review required dependency scripts before enabling them.
- Keep local dependencies, native output, and temporary work under ignored paths. Temporary deliverables belong in `tmp/` and are not committed.
- The shared FlakeHub workflow remains disabled until publication is explicitly configured. Verify public visibility and trusted organization binding, review actions, and protect `main` before enabling it. FlakeHub publication does not require npm publication.

## Task-specific documentation

- When changing compilation or native targets: [Bun standalone executables](https://bun.com/docs/bundler/executables).
- When changing Nix packaging: [bun2nix mkDerivation](https://github.com/nix-community/bun2nix/blob/0f2a1f0b6f42cebe3b149bf62d38754c5e0e9729/docs/src/building-packages/mkDerivation.md).
- When changing dependency installation: [bun2nix hook](https://github.com/nix-community/bun2nix/blob/0f2a1f0b6f42cebe3b149bf62d38754c5e0e9729/docs/src/building-packages/hook.md).
- When changing the parallel task graph or artifact caching: [Vite+ run configuration](https://viteplus.dev/config/run) and [automatic tracking](https://viteplus.dev/guide/automatic-data-tracking).
- When enabling npm publication: [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/).
- When enabling FlakeHub publication: [official publishing wizard](https://flakehub.com/new).

_This AGENTS.md was generated from the [share-artifact skill](https://raw.githubusercontent.com/totto2727-org/agent/refs/heads/main/plugins/totto2727-coding/skills/share-artifact/SKILL.md) and [AGENTS template](https://raw.githubusercontent.com/totto2727-org/agent/refs/heads/main/plugins/totto2727-coding/skills/share-artifact/agents/template.md)._
