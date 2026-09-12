{ lib, bun2nix }:
bun2nix.mkDerivation {
  pname = "project";
  packageJson = ./package.json;
  src = lib.fileset.toSource {
    root = ./.;
    fileset = lib.fileset.unions [
      ./src
      ./package.json
      ./bun.lock
      ./tsconfig.json
    ];
  };
  module = "src/main.ts";

  bunDeps = bun2nix.fetchBunDeps {
    bunNix = ./bun.nix;
  };
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
