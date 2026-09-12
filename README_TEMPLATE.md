# username/project

Project prints a friendly greeting from a standalone command-line executable.

## Usage

Print a greeting to standard output:

```bash
project
```

Expected result:

```text
Hello, world!
```

## Key features

- Prints a greeting without configuration or network access.
- Runs as a native executable without a separately installed Bun or Node.js runtime.
- Offers a portable npm CLI powered by Bun.
- Provides Nix package and overlay outputs.

## Prerequisites

- **Platform**: macOS on Apple Silicon, or Linux on ARM64 or x86-64.
- **Nix installation**: Enable `nix-command` and `flakes`. The native executable needs no separate Bun or Node.js runtime.
- **npm installation**: Install Node.js 24 or later with npm for `npm`/`npx`, and install Bun on PATH to run the portable CLI.

## Setup

### Run without installing

```bash
npx @username/project
nix run github:username/project
```

### Install

```bash
npm install --global @username/project
nix profile add github:username/project
```

### Nix flake

```nix
{
  inputs = {
    nixpkgs.url = "https://flakehub.com/f/NixOS/nixpkgs/0.1";
    project.url = "github:username/project";
    project.inputs.nixpkgs.follows = "nixpkgs";
  };

  outputs = { nixpkgs, project, ... }:
    let
      system = "aarch64-darwin";
      pkgs = import nixpkgs {
        inherit system;
        overlays = [ project.overlays.default ];
      };
    in {
      devShells.${system}.default = pkgs.mkShell {
        packages = [ pkgs.project ];
      };
    };
}
```

Choose `aarch64-linux` or `x86_64-linux` instead for a supported Linux host.

## API

### `project`

Prints `Hello, world!` followed by a newline to standard output and exits successfully.
No options or positional arguments are supported, and any supplied arguments are ignored.

```bash
project
```

## Development

See [AGENTS.md](AGENTS.md) for developer and AI instructions.

## License

[MIT](LICENSE)

_This README was generated from the [share-artifact skill](https://raw.githubusercontent.com/totto2727-org/agent/refs/heads/main/plugins/totto2727-coding/skills/share-artifact/SKILL.md) and [README template](https://raw.githubusercontent.com/totto2727-org/agent/refs/heads/main/plugins/totto2727-coding/skills/share-artifact/readme/template.md)._
