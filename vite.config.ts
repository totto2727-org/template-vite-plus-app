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
  run: {
    tasks: {
      build: {
        command: 'bun build --compile src/main.ts --outfile build/project',
        cache: false,
      },
      ci: {
        command: 'vp check && vp test run && vp run build',
        cache: false,
      },
      fix: {
        command: 'vp check --fix',
        cache: false,
      },
    },
  },
})
