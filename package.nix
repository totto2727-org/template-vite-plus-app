{ lib, bun2nix }:
bun2nix.mkDerivation {
  pname = "project";
  packageJson = ./package.json;
  src = lib.fileset.toSource {
    root = ./.;
    fileset = lib.fileset.unions [
      ./src
      ./package.json
      ./bunfig.toml
      ./bun.lock
      ./tsconfig.json
    ];
  };
  module = "src/main.ts";

  bunDeps = bun2nix.fetchBunDeps {
    bunNix = ./bun.nix;
  };
  postBunSetInstallCacheDirPhase = ''
    # The store cache is read-only, but Bun needs to update its build-local copy.
    chmod -R u+w "$BUN_INSTALL_CACHE_DIR"
  '';
  bunInstallFlags = [
    "--frozen-lockfile"
    "--linker=hoisted"
    "--backend=copyfile"
  ];
  dontRunLifecycleScripts = true;
  # Match the local standalone build and preserve ESM semantics.
  bunCompileToBytecode = false;
  removeBunBuildFlags = [
    "--minify"
    "--sourcemap"
  ];

  meta = {
    description = "A simple Bun command-line application";
    license = lib.licenses.mit;
    platforms = [
      "aarch64-darwin"
      "aarch64-linux"
      "x86_64-linux"
    ];
  };
}
