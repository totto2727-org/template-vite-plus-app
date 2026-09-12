# template-vite-plus-app initialization

## Template files

| File                                                      | Meaning                                                                         |
| --------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `README.md`                                               | AI initialization entrypoint, replaced during initialization.                   |
| `AGENTS.md`                                               | File meanings and initialization steps, replaced during initialization.         |
| `README_TEMPLATE.md`                                      | End-user documentation to customize and promote to README.md.                   |
| `AGENTS_TEMPLATE.md`                                      | Developer and AI guidance to customize and promote to AGENTS.md.                |
| `src/main.ts`                                             | Bun CLI entrypoint.                                                             |
| `src/greet.ts`, `src/greet.test.ts`                       | Starter behavior and Vite+ tests.                                               |
| `package.json`                                            | Project identity, Bun start script, and private development package.            |
| `pnpm-lock.yaml`                                          | Vite+ development dependency lock.                                              |
| `bun.lock`, `bun.nix`                                     | Bun dependency lock and generated bun2nix dependency sources for Nix packaging. |
| `vite.config.ts`                                          | Vite+ formatter, linter, type checks, tests, and task definitions.              |
| `tsconfig.json`                                           | TypeScript checking policy.                                                     |
| `flake.nix`, `flake.lock`                                 | Pinned development tools, compiled CLI package, and reusable overlay.           |
| `package.nix`                                             | bun2nix-backed standalone executable package, not a source runtime wrapper.     |
| `.envrc`                                                  | Optional direnv entrypoint.                                                     |
| `.github/workflows/ci.yml`                                | Shared Nix/TypeScript setup and aggregated Vite+ validation.                    |
| `.github/workflows/flakehub-publish-rolling.yml.disabled` | Disabled shared rolling FlakeHub publication.                                   |
| `.gitignore`                                              | Local dependencies, build output, and temporary artifact exclusions.            |
| `LICENSE`                                                 | License and copyright holder to review.                                         |

## Initialization

### 1. Establish the project

Use the user's repository name, command name, purpose, and license.
Resolve missing ownership and publication decisions with the user instead of inventing them.
Work from the copied repository root, enter `nix develop`, and run `vp install --frozen-lockfile`.
Review `.envrc` before optionally running `direnv allow`.

### 2. Replace the starter

Update the identity and repository URL in `package.json`, the flake description, and the license holder.
Replace `project` in `vite.config.ts`, `package.nix`, the package/overlay attributes in `flake.nix`, and documentation with the desired executable name.
Replace the source and tests with the project's behavior.
Retain `bun src/main.ts` for development execution and `bun build --compile src/main.ts --outfile build/project` for the native build, adjusting the entrypoint and command name if needed.
Keep both formatting and linting in Vite+, including `semi: false`, single quotes, line width 120, and unwrapped Markdown prose.
Keep shared `totto2727-org/monorepo` action references on `@main` and the workflow's `eval "$(nix print-dev-env "$GITHUB_WORKSPACE#default")"` environment loading.
Do not create `CLAUDE.md`.

### 3. Maintain dependency locks and Nix packaging

Keep `package.nix` and the flake package/overlay outputs as the compiled CLI distribution.
The root bun2nix input follows `vite-plus-overlay/bun2nix`, reusing the existing pinned dependency instead of adding an independently versioned builder.
After changing dependencies, run `vp install`, `bun install --lockfile-only --ignore-scripts`, and `bun2nix -o bun.nix` inside the Nix shell.
Review and commit `pnpm-lock.yaml`, `bun.lock`, and `bun.nix` together.
The Bun lock mirrors the same manifest for Nix packaging, not a second published artifact.
Update `flake.lock` only when changing Nix inputs or intentionally updating pins.
Review any dependency lifecycle scripts before explicitly allowing them in `package.nix`.

### 4. Create the project documents

Customize `README_TEMPLATE.md` for actual end-user usage, supported installation paths, API, and license.
Customize `AGENTS_TEMPLATE.md` for the real file layout, developer commands, architecture, and operational boundaries.
Replace `username/project` and other placeholders, and remove unsupported features or instructions.
Promote the customized files to `README.md` and `AGENTS.md`, replacing these initialization documents and removing the `_TEMPLATE` files.
Keep template initialization instructions out of the final copied-project documents.

### 5. Decide optional publication

Keep `private: true` by default.
This CLI template intentionally has no npm publishing workflow, npm `bin` metadata, or separate JavaScript bundle.
Only add npm distribution if the user explicitly requests it and chooses how to distribute platform-specific executables or a runtime-dependent package.
Do not silently produce both native and npm artifacts.

Keep `.github/workflows/flakehub-publish-rolling.yml.disabled` disabled unless FlakeHub publication is explicitly wanted.
Before enabling it, use the [official FlakeHub wizard](https://flakehub.com/new) to verify public repository visibility and the trusted organization binding, review the shared actions and pinned third-party actions, and protect `main`.
Then rename it to `flakehub-publish-rolling.yml`, or delete it if not wanted.
The shared `publish-flakehub@main` action publishes a public rolling release on pushes to `main` with job-scoped OIDC permissions.
FlakeHub and npm publication are independent choices.

### 6. Validate and hand off

Run `vp run fix` and `vp run ci`.
The aggregate task runs Vite+ formatting/lint/type checks, Vite+ tests, and Bun compilation, but does not start the application or run a smoke command.
Separately run the compiled executable with Bun and Node absent from PATH and verify its expected output, as described in the customized developer document.
Nix package builds are neither required initialization validation nor part of normal CI.
Review the final documents for obsolete paths and placeholders, exclude temporary files under `tmp/`, and commit the initialized project.
