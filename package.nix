{
  lib,
  stdenv,
  nodejs_26,
  pnpm,
  pnpmConfigHook,
  fetchPnpmDeps,
  vite-plus,
  darwin,
}:
stdenv.mkDerivation (finalAttrs: {
  pname = "project";
  version = (lib.importJSON ./package.json).version;
  src = lib.fileset.toSource {
    root = ./.;
    fileset = lib.fileset.unions [
      ./src
      ./package.json
      ./pnpm-lock.yaml
      ./pnpm-workspace.yaml
      ./.node-version
      ./tsconfig.json
      ./vite.config.ts
    ];
  };

  pnpmDeps = fetchPnpmDeps {
    inherit (finalAttrs) pname version src;
    inherit pnpm;
    fetcherVersion = 4;
    hash = "sha256-gKDdjUegVNmHBDs8eGxq+oN5pRZK6XsLp6MnCSEvGzE=";
  };
  nativeBuildInputs = [
    nodejs_26
    pnpm
    pnpmConfigHook
    vite-plus
  ]
  ++ lib.optionals stdenv.hostPlatform.isDarwin [ darwin.sigtool ];

  buildPhase = ''
    runHook preBuild
    node_modules/.bin/vp run build
    runHook postBuild
  '';
  installPhase = ''
    runHook preInstall
    install -Dm755 build/project $out/bin/project
    runHook postInstall
  '';

  # Rewriting or stripping the SEA binary can damage its embedded program/signature.
  dontFixup = true;
  doInstallCheck = true;
  installCheckPhase = ''
    runHook preInstallCheck
    test "$(env -i PATH= $out/bin/project)" = "Hello, world!"
    runHook postInstallCheck
  '';

  meta = {
    description = "A standalone Node.js command-line application";
    license = lib.licenses.mit;
    mainProgram = "project";
    platforms = [
      "aarch64-darwin"
      "aarch64-linux"
      "x86_64-linux"
    ];
  };
})
