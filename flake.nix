{
  description = "A Node.js CLI template with pnpm and Vite+ tooling";

  inputs = {
    nixpkgs.url = "https://flakehub.com/f/NixOS/nixpkgs/0.1";
    vite-plus-overlay = {
      url = "github:ryoppippi/nix-vite-plus";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs =
    {
      nixpkgs,
      vite-plus-overlay,
      ...
    }:
    let
      supportedSystems = [
        "aarch64-darwin"
        "aarch64-linux"
        "x86_64-linux"
      ];
      forEachSystem = nixpkgs.lib.genAttrs supportedSystems;
      overlay = final: _previous: {
        project = final.callPackage ./package.nix { };
      };
      mkPkgs =
        system:
        import nixpkgs {
          inherit system;
          overlays = [
            vite-plus-overlay.overlays.default
            overlay
          ];
        };
    in
    {
      overlays.default = overlay;
      packages = forEachSystem (
        system:
        let
          pkgs = mkPkgs system;
        in
        rec {
          inherit (pkgs) project;
          default = project;
        }
      );
      devShells = forEachSystem (
        system:
        let
          pkgs = mkPkgs system;
          developmentTools = [
            pkgs.nodejs_24
            pkgs.pnpm
            pkgs.vite-plus
            pkgs.nixfmt
          ];
        in
        {
          default = pkgs.mkShell {
            packages = developmentTools;
          };
          native = pkgs.mkShell {
            packages = developmentTools ++ [ pkgs.bun ];
          };
        }
      );
    };
}
