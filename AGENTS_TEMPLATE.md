# username/project

## Repository structure

```text
src/main.ts         Node.js CLI entrypoint and console output
src/greet.ts        Pure greeting behavior
src/greet.test.ts   Vite+ unit tests
vite.config.ts     Vite+ formatter, linter, type checks, tests, and pack/task configurations
package.json       Private package, Node.js bin script, and portable npm launcher
.node-version      Node.js 26 runtime selection
pnpm-workspace.yaml pnpm overrides and strict 1440-minute release-age policy
pnpm-lock.yaml     Sole dependency lock for development and Nix packaging
flake.nix          Development shell, compiled package, and reusable overlay
package.nix        fetchPnpmDeps-backed executable package installed as bin/project
```

## Development commands

### Execution rules

- Run commands from the repository root inside `nix develop`.
- Use Vite+ for both formatting and linting, as well as type checking and tests.
- Use Node.js 26 or newer for source execution and Vite+ executable packaging. Use pnpm as the sole project package manager.
- Keep Nix package build validation separate from source tasks and regular CI.
- Keep `AGENTS.md` canonical and do not create `CLAUDE.md`.

### Standard tasks

- `nix develop`: Enter the pinned Node.js 26, pnpm, Vite+, and nixfmt environment.
- `vp install --frozen-lockfile`: Install locked development dependencies.
- `vp run bin`: Run the CLI using `vp exec node src/main.ts`.
- `vp run fix`: Apply Vite+ formatting and supported lint fixes with `vp check --fix`.
- `vp run check`: Check formatting, lint, and TypeScript types through the cached `vp check` task.
- `vp run test`: Run tests once through the cached `vp test run` task.
- `vp run build`: Run `vp pack --filter executable` for the current OS and CPU. The named pack configuration enables executable mode with `exe: { fileName: 'project' }` and writes `build/project`.
- `vp run pack`: Build the portable Node.js-shebang npm launcher with `vp pack --filter npm` into `dist/main.mjs`, separate from the native executable.
- `vp run npm:check`: Build `pack` first, then inspect npm package contents with `vp pm pack -- --dry-run`.
- `vp run ci`: Schedule independent checks, tests, native compilation, and portable packaging in parallel. npm verification depends on packaging. Do not execute the application in regular CI.
- `vp run --verbose --log labeled ci`: Inspect dependency scheduling and cache hit/miss reasons. Put runner flags before the task name.
- `env -i PATH= "$PWD/build/project"`: Separately validate the compiled executable without Bun or Node.js on PATH after building. Expect `Hello, world!` and exit status 0.
- `vp install`: Update the sole dependency lock and development installation after manifest changes.
- After dependency updates, refresh `pnpmDeps.hash` in `package.nix` from the fixed-output hash reported by a Nix build when needed. There is no generated secondary dependency manifest.
- `vp pm pack --pack-destination tmp`: Create an actual npm archive for optional local installed-CLI validation after `vp run pack`. Keep it out of commits.
- `nixfmt flake.nix package.nix`: Format maintained Nix expressions.
- `nix eval .#packages.aarch64-darwin.default.drvPath`: Optionally evaluate the package derivation without building it. Substitute another supported system as needed.
- `nix build .#project`: Optionally build the Nix package when explicitly needed, never as a regular CI requirement.

## Architecture

### CI and publication policy

- Keep the inherited CI and publication workflows unchanged by default.
- Do not replace publication on pushes to `main` with tag or release triggers. Preserve existing tag triggers where already configured.
- Change workflows only for an explicit user request or a demonstrated project requirement, and explain why the change is necessary.
- Publication setup does not justify unrelated CI changes.

### CLI and distribution

- Keep process I/O in `src/main.ts` and greeting behavior in the pure module.
- `build/project` is a native Node.js single executable application, not a source wrapper. `dist/main.mjs` is the separate portable npm launcher and retains `#!/usr/bin/env node`.
- Vite+ executable mode is experimental upstream. Native executables target the build host's OS and CPU. Cross-platform release artifacts require an explicit distribution design.
- The native CLI needs no Node.js or Bun command on PATH. The npm CLI requires Node.js 26 or newer.
- The Nix-built executable retains its Nix runtime closure, including dynamically linked libraries where applicable. It is not a portable static executable that can be copied outside Nix independently.
- `package.nix` uses `fetchPnpmDeps` with `fetcherVersion = 4` and `pnpmConfigHook` to install frozen dependencies offline, runs the same `build` task, and installs `$out/bin/project`.
- Preserve `dontFixup = true`: rewriting or stripping the embedded executable can damage its program or signature. Darwin packaging provides `darwin.sigtool` for signing.
- The Nix install check runs the packaged CLI with an empty PATH and expects `Hello, world!`. Keep Nix package builds outside normal CI.

## Development tools

- **Nix inputs**: `ryoppippi/nix-vite-plus` supplies pinned Vite+ tooling, overridden to use Node.js 26. It still uses Bun and bun2nix internally. Those tooling dependencies do not make Bun the project's package manager, compiler, or application runtime. The project package uses nixpkgs dependency provisioning instead.
- **Dependencies**: Use pnpm as the only project package manager. `pnpm-lock.yaml` supplies both development and Nix packaging. Keep `packageManager` aligned with the Nix shell's pnpm version. Keep `minimumReleaseAge: 1440` and `minimumReleaseAgeStrict: true` in `pnpm-workspace.yaml` for the strict 24-hour release-age policy, without exclusions. Keep Vite+ exactly pinned in the workspace catalog, with its official `vite@*` alias and bundled `vitest@*` overrides in that workspace file. Keep `allowBuilds.vite-plus: false` for prebuilt tools and review every new lifecycle script before allowing it. When updating Vite+, match the alias to the installed `vite-plus` version and the `vitest` override to `vp toolchain vitest`. Do not create npm or Bun lockfiles. Review dependency scripts before allowing them. See [pnpm settings](https://pnpm.io/settings).
- **Vite+**: The globally pinned `vp` CLI and the local `vite-plus` dependency are independently versioned. Formatting retains no semicolons, single quotes, width 120, and unwrapped Markdown prose.
- **TypeScript**: Extend the exact `@tsconfig/strictest` and `@tsconfig/node-ts` presets in that order. Inherit strictness, erasable syntax, relative TypeScript import rewriting, and verbatim modules without duplicating or weakening them locally. Only ESNext targeting, NodeNext modules, no-emit, and Node types are local. NodeNext supplies module resolution, and import rewriting permits `.ts` import paths without a separate `allowImportingTsExtensions` override. Use default file discovery without custom `include`, `files`, or `exclude` lists.
- **Task cache**: All configured tasks use Vite+'s default caching. `ci` is an empty command with dependency edges, not shell orchestration. Native outputs are explicitly archived from `build/**` and excluded from automatic inputs. `pack` archives `dist/**`. Use `vp run --last-details` to inspect replay and invalidation behavior.
- **Fix task**: Keep default caching for `vp check --fix`. Vite+ detects read-and-write inputs and declines unsafe cache entries when it changes source files. Reintroducing malformed source must still be corrected.
- **GitHub Actions**: CI runs shared `setup-typescript@main` before `setup-nix@main` so `vp` is available when Nix shell hooks run. The TypeScript setup uses `vp install --frozen-lockfile` to select pnpm from `packageManager`, then evaluates `eval "$(nix print-dev-env "$GITHUB_WORKSPACE#default")"` before `vp run --no-cache ci`. Keep shared org references on `@main`. Do not add a start/smoke task or `nix build` to regular CI.

## Package-specific rules

- Keep npm publication disabled with `private: true` and the disabled publishing workflow until registry ownership and repository-linked OIDC trust are configured. The portable Node.js launcher lives only in `dist/`, and the npm `files` allowlist must never include native `build/` output.
- Nix dependency installation uses the frozen pnpm lock and disables lifecycle scripts. Review required dependency scripts before enabling them.
- Keep local dependencies, native output, and temporary work under ignored paths. Temporary deliverables belong in `tmp/` and are not committed.
- The shared FlakeHub workflow remains disabled until publication is explicitly configured. Verify public visibility and trusted organization binding, review actions, and protect `main` before enabling it. FlakeHub publication does not require npm publication.

## Task-specific documentation

- When changing compilation or native targets: [Vite+ pack](https://viteplus.dev/guide/pack) and [Node.js single executable applications](https://nodejs.org/api/single-executable-applications.html).
- When changing Nix packaging or dependency installation: [nixpkgs pnpm packaging](https://nixos.org/manual/nixpkgs/stable/#javascript-pnpm).
- When changing the pinned tooling: [nix-vite-plus](https://github.com/ryoppippi/nix-vite-plus).
- When changing the parallel task graph or artifact caching: [Vite+ run configuration](https://viteplus.dev/config/run) and [automatic tracking](https://viteplus.dev/guide/automatic-data-tracking).
- When enabling npm publication: [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/).
- When enabling FlakeHub publication: [official publishing wizard](https://flakehub.com/new).

_This AGENTS.md was generated from the [share-artifact skill](https://raw.githubusercontent.com/totto2727-org/agent/refs/heads/main/plugins/totto2727-coding/skills/share-artifact/SKILL.md) and [AGENTS template](https://raw.githubusercontent.com/totto2727-org/agent/refs/heads/main/plugins/totto2727-coding/skills/share-artifact/agents/template.md)._
