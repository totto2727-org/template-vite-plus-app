import { defineConfig } from 'vite-plus'

export default defineConfig({
  fmt: {
    arrowParens: 'always',
    experimentalSortImports: {
      ignoreCase: true,
      newlinesBetween: true,
      order: 'asc',
    },
    experimentalSortPackageJson: true,
    jsxSingleQuote: true,
    printWidth: 120,
    proseWrap: 'preserve',
    semi: false,
    singleQuote: true,
  },
  lint: { options: { typeAware: true, typeCheck: true } },
  test: { include: ['src/**/*.test.ts'] },
  pack: { entry: ['src/main.ts'], format: ['esm'], platform: 'node', clean: true },
  run: {
    tasks: {
      build: {
        command: 'nix develop .#native --command bun build --compile src/main.ts --outfile build/project',
        cache: {
          input: [{ auto: true }, '!build/**'],
          output: ['build/**'],
        },
      },
      check: 'vp check',
      ci: {
        command: '',
        dependsOn: ['check', 'test', 'npm:check'],
      },
      fix: 'vp check --fix',
      'npm:check': {
        command: 'vp pm pack -- --dry-run',
        dependsOn: ['pack'],
      },
      pack: {
        command: 'vp pack',
        cache: { output: ['dist/**'] },
      },
      test: 'vp test run',
    },
  },
})
