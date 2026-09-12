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
        command: 'bun build --compile src/main.ts --outfile build/project',
        input: [{ auto: true }, '!build/**'],
        output: ['build/**'],
      },
      check: 'vp check',
      ci: {
        command: '',
        dependsOn: ['check', 'test', 'build', 'npm:check'],
      },
      fix: 'vp check --fix',
      'npm:check': {
        command: 'npm pack --dry-run',
        dependsOn: ['pack'],
      },
      pack: {
        command: 'vp pack',
        output: ['dist/**'],
      },
      test: 'vp test run',
    },
  },
})
