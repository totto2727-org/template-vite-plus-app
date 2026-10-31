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
  pack: [
    { entry: ['src/main.ts'], format: ['esm'], platform: 'node', clean: true },
    {
      name: 'executable',
      entry: ['src/main.ts'],
      format: ['esm'],
      platform: 'node',
      outDir: 'build',
      clean: true,
      exe: { fileName: 'project' },
    },
  ],
  run: {
    tasks: {
      build: {
        command: 'vp pack',
        cache: {
          input: [{ auto: true }, '!build/**', '!dist/**'],
          output: ['build/**', 'dist/**'],
        },
      },
      check: 'vp check',
      ci: {
        command: '',
        dependsOn: ['check', 'test', 'build', 'npm:check'],
      },
      fix: 'vp check --fix',
      'npm:check': {
        command: 'vp pm pack -- --dry-run',
        dependsOn: ['build'],
      },
      test: 'vp test run',
    },
  },
})
