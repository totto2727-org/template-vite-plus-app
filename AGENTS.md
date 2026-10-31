# template-vite-plus-app initialization

## Template files

| File                                                      | Meaning                                                                           |
| --------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `README.md`                                               | AI initialization entrypoint, replaced during initialization.                     |
| `AGENTS.md`                                               | File meanings and initialization steps, replaced during initialization.           |
| `README_TEMPLATE.md`                                      | End-user documentation to customize and promote to README.md.                     |
| `AGENTS_TEMPLATE.md`                                      | Developer and AI guidance to customize and promote to AGENTS.md.                  |
| `src/main.ts`                                             | Node.js CLI entrypoint.                                                           |
| `src/greet.ts`, `src/greet.test.ts`                       | Starter behavior and Vite+ tests.                                                 |
| `package.json`                                            | Project identity, Node.js bin script, npm launcher metadata, and private package. |
| `pnpm-workspace.yaml`                                     | pnpm overrides and strict 1440-minute dependency release-age policy.              |
| `pnpm-lock.yaml`                                          | Sole dependency lock for development and Nix packaging.                           |
| `vite.config.ts`                                          | Vite+ formatter, linter, type checks, tests, and task definitions.                |
| `tsconfig.json`                                           | TypeScript checking policy.                                                       |
| `flake.nix`, `flake.lock`                                 | Pinned development tools, compiled CLI package, and reusable overlay.             |
| `package.nix`                                             | fetchPnpmDeps-backed Vite+ executable package with a Nix runtime closure.         |
| `.envrc`                                                  | Optional direnv entrypoint.                                                       |
| `.github/workflows/ci.yml`                                | Shared Nix/TypeScript setup and aggregated Vite+ validation.                      |
| `.github/workflows/publish.yml.disabled`                  | Disabled repository-linked npm publication through the shared action.             |
| `.github/workflows/flakehub-publish-rolling.yml.disabled` | Disabled shared rolling FlakeHub publication.                                     |
| `.gitignore`                                              | Local dependencies, build output, and temporary artifact exclusions.              |
| `LICENSE`                                                 | License and copyright holder to review.                                           |

## Initialization

### CI and publication policy

Keep the template's CI and publication workflows unchanged by default when creating a project.
In particular, do not replace publication on pushes to `main` with tag or release triggers.
Preserve existing tag triggers where the template already uses them.
Change workflows only for an explicit user request or a demonstrated project requirement, and explain why the change is necessary.
Project metadata replacement and the optional publication setup below are permitted, but do not justify unrelated CI changes.
Retain this policy in the generated project's `AGENTS.md`.

### 1. Establish the project

Use the user's repository name, command name, purpose, and license.
Resolve missing ownership and publication decisions with the user instead of inventing them.
Work from the copied repository root, enter `nix develop`, and run `vp install --frozen-lockfile`.
Review `.envrc` before optionally running `direnv allow`.

### 2. Replace the starter

Update the identity and repository URL in `package.json`, the flake description, and the license holder.
Replace `project` in `package.json`'s `bin` mapping, `vite.config.ts`, `package.nix`, the package/overlay attributes in `flake.nix`, and documentation with the desired executable name.
Replace the source and tests with the project's behavior.
Retain the `bin` script using `vp exec node src/main.ts` for development execution and `vp pack --filter executable` for the native `build` task, adjusting the entrypoint and command name if needed.
The executable pack configuration uses `exe: { fileName: 'project' }` with `outDir: 'build'`, which enables Vite+'s executable mode without also building the npm configuration.
Keep Node.js 26 or newer for source execution and Node single executable application packaging, with `.node-version` aligned with the pinned Nix shell.
The separate `pack` task uses `vp pack --filter npm` to generate `dist/main.mjs` for npm with a Node.js shebang. Keep the npm `bin` mapping and `files: ["dist"]` aligned with this output, never with the native `build/` directory.
Keep `tsconfig.json` extending the exact `@tsconfig/strictest` and `@tsconfig/node-ts` presets in that order, with ESNext targeting and only project-specific options locally.
Keep both formatting and linting in Vite+, including `semi: false`, single quotes, line width 120, and unwrapped Markdown prose.
Keep shared `totto2727-org/monorepo` action references on `@main` and the workflow's `eval "$(nix print-dev-env "$GITHUB_WORKSPACE#ci")"` environment loading. The `ci` shell omits the local Git hook setup.
Do not create `CLAUDE.md`.

### 3. Maintain dependency locks and Nix packaging

Keep `package.nix` and the flake package/overlay outputs as the compiled CLI distribution.
Use pnpm as the only project package manager, with `pnpm-lock.yaml` for both development and Nix packaging. Do not introduce Bun or npm lockfiles.
After changing dependencies, run `vp install` inside the Nix shell and update the `pnpmDeps.hash` in `package.nix` from a Nix build's reported fixed-output hash when needed.
Use `fetchPnpmDeps` with `fetcherVersion = 4` and `pnpmConfigHook` for offline frozen dependency installation. Keep their pnpm version aligned with `packageManager`. Declare Node.js and pnpm directly only in `package.nix` for Nix builds, not in development shells.
Keep `pnpm-workspace.yaml`'s `minimumReleaseAge: 1440` and `minimumReleaseAgeStrict: true`, without release-age exclusions. The interval is 24 hours expressed in minutes.
The `ryoppippi/nix-vite-plus` input supplies Vite+ tooling and still uses Bun and bun2nix internally. This does not make Bun a project package manager or application runtime.
The native Nix package embeds the CLI in Node.js, but retains its required Nix runtime closure. Do not describe it as a portable static executable.
Keep Vite+ exactly pinned through the `vite-plus` catalog entry and retain the official `vite@*` alias and bundled `vitest@*` overrides in `pnpm-workspace.yaml`, as specified by the installed Vite+ README.
Keep `allowBuilds.vite-plus: false` because the tools are prebuilt, and review every new lifecycle script before allowing it.
When updating Vite+, match the `vite` alias to the installed `vite-plus` version and the `vitest` override to `vp toolchain vitest`.
Update `flake.lock` only when changing Nix inputs or intentionally updating pins.
Review any dependency lifecycle scripts before explicitly allowing them in `package.nix`.

### 4. Create the project documents

Customize `README_TEMPLATE.md` for actual end-user usage, supported installation paths, API, and license.
Customize `AGENTS_TEMPLATE.md` for the real file layout, developer commands, architecture, and operational boundaries.
Replace `username/project` and other placeholders, and remove unsupported features or instructions.
Promote the customized files to `README.md` and `AGENTS.md`, replacing these initialization documents and removing the `_TEMPLATE` files.
Keep template initialization instructions out of the final copied-project documents.

### 5. Decide optional publication

Keep `private: true` and `.github/workflows/publish.yml.disabled` disabled until npm publication is explicitly configured.
The native `build/project` embeds Node.js and needs no runtime command on PATH, while the separate npm artifact requires Node.js 26 or newer on the consumer's PATH. The Nix-built executable still needs its Nix runtime closure.
Replace the npm package name, repository URL, version, command name, and copied-document `@username/project` placeholders with the actual package identity.
Confirm ownership and configure the npm package's Trusted Publisher for the exact GitHub owner, repository, and `publish.yml` filename. If the package must first be created, the owner performs that initial publication manually.
Keep job-scoped `id-token: write` permissions and shared `setup-nix@main`, `setup-typescript@main`, and `publish-npm@main`, with `working-directory: .`. Do not add registry tokens.
Review the shared actions, protect release tags, remove `private: true` only when ready, and rename the disabled workflow to `publish.yml` only after trust is configured.
Validate `vp run npm:check`, inspect an actual `vp pm pack --pack-destination tmp` archive, and verify its installed Node.js CLI before publishing. The tarball must contain `dist/` and package metadata, never `build/`, source files, or temporary artifacts.
The release workflow builds only the portable npm artifact and publishes through the shared action on a `v<version>` tag matching `package.json`. Native Nix packaging remains independent.
See [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/) for registry setup requirements.

Keep `.github/workflows/flakehub-publish-rolling.yml.disabled` disabled unless FlakeHub publication is explicitly wanted.
Before enabling it, use the [official FlakeHub wizard](https://flakehub.com/new) to verify public repository visibility and the trusted organization binding, review the shared actions and pinned third-party actions, and protect `main`.
Then rename it to `flakehub-publish-rolling.yml`, or delete it if not wanted.
The shared `publish-flakehub@main` action publishes a public rolling release on pushes to `main` with job-scoped OIDC permissions.
FlakeHub and npm publication are independent choices.

### 6. Validate and hand off

Run `vp run fix` and `vp run ci`.
The aggregate task schedules independent checks, tests, native compilation, and portable packaging in parallel through Vite+ dependencies. The npm dry run depends on `pack`. CI does not execute the application or a smoke command.
Keep default task caching, including `fix`. Native output is declared with `cache: { output: ['build/**'] }` and excluded from automatic build input tracking. Verify cached output restoration and source/configuration invalidation when changing task definitions.
Separately run the compiled executable with Bun and Node absent from PATH and verify its expected output, as described in the customized developer document.
Nix package builds are neither required initialization validation nor part of normal CI.
Review the final documents for obsolete paths and placeholders, exclude temporary files under `tmp/`, and commit the initialized project.
