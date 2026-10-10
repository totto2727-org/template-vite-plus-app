{
  lib,
  stdenvNoCC,
  nodejs_24,
  pnpm,
  pnpmConfigHook,
  fetchPnpmDeps,
  bun,
}:
stdenvNoCC.mkDerivation (finalAttrs: {
  pname = "project";
  version = (lib.importJSON ./package.json).version;
  src = lib.fileset.toSource {
    root = ./.;
    fileset = lib.fileset.unions [
      ./src
      ./package.json
      ./pnpm-workspace.yaml
      ./pnpm-lock.yaml
      ./tsconfig.json
    ];
  };

  nativeBuildInputs = [
    nodejs_24
    pnpm
    pnpmConfigHook
    bun
  ];
  pnpmDeps = fetchPnpmDeps {
    inherit (finalAttrs) pname version src;
    fetcherVersion = 4;
    pnpmInstallFlags = [ "--prod" ];
    hash = "sha256-dIp6CNh1Kn4aqJWku1G/FUdn/u+epzhqlqwnAkB2uW0=";
  };
  pnpmInstallFlags = [ "--prod" ];

  buildPhase = ''
    runHook preBuild
    bun build --compile src/main.ts --outfile build/project
    runHook postBuild
  '';
  installPhase = ''
    runHook preInstall
    install -Dm755 build/project $out/bin/project
    runHook postInstall
  '';
  # The embedded Bun runtime must not be stripped or have its shebang patched.
  dontFixup = true;

  meta = {
    description = "A standalone command-line application";
    license = lib.licenses.mit;
    mainProgram = "project";
    platforms = [
      "aarch64-darwin"
      "aarch64-linux"
      "x86_64-linux"
    ];
  };
})
