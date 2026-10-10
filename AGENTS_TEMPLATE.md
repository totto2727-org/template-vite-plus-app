# username/project

## Repository structure

```text
src/main.ts          Node.js TypeScript CLI entrypoint
src/greet.ts         Pure greeting behavior
src/greet.test.ts    Vite+ unit tests
vite.config.ts       Vite+ formatting, lint, type checks, tests, and tasks
package.json         Private package, Node.js bin script, and npm launcher metadata
pnpm-workspace.yaml  Catalog, Vite+ overrides, lifecycle trust, and release-age policy
pnpm-lock.yaml       Sole dependency lock for development and Nix packaging
flake.nix            Development shell, compiled package, and standalone overlay
package.nix          pnpm-backed native compile package installed as bin/project
```

## Development commands

### Execution rules

- Run commands from the repository root inside `nix develop`.
- Use Node.js for source execution, pnpm for dependency management, and Vite+ for formatting, linting, type checks, tests, and portable packaging.
- Bun is only the existing native executable compiler in the optional `native` shell and Nix package, not the package manager or a default-development/source-runtime requirement.
- Keep Nix package build validation separate from source tasks and regular CI.
- Keep `AGENTS.md` canonical and do not create `CLAUDE.md`.

### Standard tasks

- `nix develop`: Enter the pinned Node.js 24, pnpm 11.21.0, Vite+, and nixfmt environment. `nix develop .#native` additionally supplies the existing Bun compiler.
- `vp install --frozen-lockfile`: Install locked development dependencies through pnpm.
- `vp run bin`: Run the TypeScript CLI using `vp exec node src/main.ts`.
- `vp run fix`: Apply Vite+ formatting and supported lint fixes.
- `vp run check`: Check formatting, lint, and TypeScript types.
- `vp run test`: Run tests once through Vite+.
- `vp run build`: Compile the standalone native CLI with `nix develop .#native --command bun build --compile src/main.ts --outfile build/project`.
- `vp run pack`: Build the portable Node.js npm launcher with `vp pack` into `dist/main.mjs`.
- `vp run npm:check`: Build `pack` first, then inspect package contents with `vp pm pack -- --dry-run`.
- `vp run ci`: Schedule checks, tests, and portable packaging through the task graph, without requiring the native compiler.
- `vp run --no-cache ci`: Execute the same task graph freshly. CI uses this command.
- `vp run --verbose --log labeled ci`: Inspect scheduling and cache hit/miss reasons.
- `env -i PATH= "$PWD/build/project"`: Validate native execution without Node.js or Bun on PATH. Expect `Hello, world!` and exit status 0.
- `vp install`: Update the sole dependency lock after manifest changes.
- `vp pm pack --pack-destination tmp`: Create an actual npm archive after creating `tmp/` and building `pack`.
- `nixfmt flake.nix package.nix`: Format maintained Nix expressions.
- `nix eval .#packages.aarch64-darwin.default.drvPath`: Evaluate the native package. Substitute another supported system as needed.
- `nix build .#project`: Build the native Nix package when packaging changes, not in regular CI.

## Architecture

### CLI and distribution

- Keep process I/O in `src/main.ts` and behavior in the pure module.
- The entrypoint has no Bun APIs. Node.js 24 executes its erasable TypeScript and `.ts` imports directly. Do not introduce another TypeScript runtime without demonstrating a requirement.
- `build/project` is a single native executable containing the existing Bun runtime. Preserve this standalone delivery path. Node.js does not provide an equivalent `bun build --compile` command.
- `dist/main.mjs` is the separate portable npm launcher with `#!/usr/bin/env node`. It requires Node.js 24 or newer, not Bun.
- Native executables target the build host's OS and CPU. Cross-platform artifacts require an explicit distribution design.
- `package.nix` fetches production dependencies from `pnpm-lock.yaml` using `fetchPnpmDeps` with `fetcherVersion = 4`, then installs them offline with `pnpmConfigHook`. Both phases disable lifecycle scripts.
- The Nix build uses the same Bun compile command as the local native task. Do not add bytecode, minification, or sourcemaps implicitly.
- `dontFixup = true` prevents binary stripping and shebang rewriting from corrupting the embedded runtime.
- The former bun2nix installer required a second Bun lock. pnpm replaces only dependency fetching and installation, while Bun compilation and native package/overlay outputs remain.

## Development tools

- **Dependencies**: Use pnpm as the only package manager. `pnpm-lock.yaml` is the only dependency lock. Keep `packageManager` aligned with the pinned Nix shell's pnpm version. Keep `minimumReleaseAge: 1440` and `minimumReleaseAgeStrict: true` in `pnpm-workspace.yaml`, without exclusions. See [pnpm dependency policy](https://pnpm.io/settings#minimumreleaseage).
- **Vite+ versions**: Keep Vite+ exactly 1.1.0 in the catalog, the official `vite@*` override at `npm:@voidzero-dev/vite-plus-core@1.1.0`, and `vitest@*` at the bundled 5.0.3. Keep caret ranges on the other dependencies. When updating Vite+, align the alias and `vp toolchain vitest` version together. The global CLI and local dependency are independently pinned.
- **Lifecycle trust**: Deny Vite+ lifecycle scripts through `allowBuilds`. Its tools are prebuilt. Review any newly required script before granting package-specific trust, never a global allow.
- **TypeScript**: Extend `@tsconfig/strictest` and `@tsconfig/node-ts` in that order. Inherit strictness, erasable syntax, relative TypeScript import rewriting, and verbatim modules. Keep only ESNext targeting, NodeNext modules, no-emit, and Node types locally. Use default file discovery.
- **Task cache**: All source tasks retain default Vite+ caching, including `fix`. `ci` is an empty command with dependency edges. Native output archives `build/**` and excludes it from automatic inputs. Portable packaging archives `dist/**`. Check restoration and source/configuration invalidation when changing task definitions.
- **Formatting**: Retain no semicolons, single quotes, width 120, and unwrapped Markdown prose.
- **GitHub Actions**: Keep shared `setup-nix@main` and `setup-typescript@main`, which selects pnpm from `packageManager` and installs with `vp install --frozen-lockfile`. Load `eval "$(nix print-dev-env "$GITHUB_WORKSPACE#default")"` before `vp run --no-cache ci`. Do not add application execution or Nix builds to regular CI.

## Package-specific rules

- After dependency changes, update `pnpm-lock.yaml` with `vp install` and rebuild the Nix package. To refresh the production dependency hash, set `pnpmDeps.hash` to an empty string, build once, and replace it with the reported `got: sha256-...` value. Commit the verified hash and lock together. Do not bypass supply-chain policies.
- Update `flake.lock` only when Nix inputs change. Removing the direct bun2nix input does not require updating retained pins. A transitive bun2nix input may still exist in the upstream Vite+ overlay.
- Keep npm publication disabled with `private: true` and the disabled workflow until registry ownership and OIDC trust are configured. Keep job-scoped OIDC permissions and shared org actions on `@main`, without registry tokens.
- The npm `files` allowlist contains only `dist/`, never native `build/`, source, or temporary work. Before publication, inspect a real archive and run its installed CLI with Node.js and no Bun on PATH.
- Keep local dependencies, output, archives, and temporary consumers under ignored paths. Remove temporary TypeScript consumers before whole-project checks.
- Keep the shared FlakeHub workflow disabled until explicitly configured. Verify visibility, trusted organization binding, actions, and protected `main` before enabling it. FlakeHub and npm publication are independent.

## Task-specific documentation

- Native compilation: [Bun standalone executables](https://bun.com/docs/bundler/executables).
- Source runtime: [Node.js TypeScript support](https://nodejs.org/api/typescript.html).
- Nix dependency integration: [nixpkgs pnpm packaging](https://nixos.org/manual/nixpkgs/stable/#javascript-pnpm).
- Dependency policy: [pnpm settings](https://pnpm.io/settings).
- Task caching: [Vite+ run configuration](https://viteplus.dev/config/run) and [automatic tracking](https://viteplus.dev/guide/automatic-data-tracking).
- npm publication: [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/).
- FlakeHub publication: [official publishing wizard](https://flakehub.com/new).

_This AGENTS.md was generated from the [share-artifact skill](https://raw.githubusercontent.com/totto2727-org/agent/refs/heads/main/plugins/totto2727-coding/skills/share-artifact/SKILL.md) and [AGENTS template](https://raw.githubusercontent.com/totto2727-org/agent/refs/heads/main/plugins/totto2727-coding/skills/share-artifact/agents/template.md)._
