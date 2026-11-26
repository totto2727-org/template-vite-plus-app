// oxlint-disable-next-line rules/no-node-imports -- Vite+ loads this configuration in Node.js.
import { URL } from 'node:url'

import { generateIgnorePatterns } from '@totto2727/gitignore-patterns'
import applicationPreset from '@totto2727/oxlint/preset/application'
import { defineConfig } from 'vite-plus'

const ignorePatterns = await generateIgnorePatterns(new URL('.', import.meta.url))

// oxlint-disable-next-line import/no-default-export -- Vite+ loads the module default.
export default defineConfig({
  fmt: {
    arrowParens: 'always',
    experimentalSortImports: {
      ignoreCase: true,
      newlinesBetween: true,
      order: 'asc',
    },
    experimentalSortPackageJson: true,
    ignorePatterns,
    jsxSingleQuote: true,
    printWidth: 120,
    proseWrap: 'preserve',
    semi: false,
    singleQuote: true,
  },
  lint: {
    ...applicationPreset,
    ignorePatterns,
    options: { ...applicationPreset.options, typeCheck: true },
  },
  pack: [
    { clean: true, entry: ['src/main.ts'], format: ['esm'], name: 'npm', platform: 'node' },
    {
      clean: true,
      entry: ['src/main.ts'],
      exe: { fileName: 'project' },
      format: ['esm'],
      name: 'executable',
      outDir: 'build',
      platform: 'node',
    },
  ],
  run: {
    tasks: {
      build: {
        cache: {
          input: [{ auto: true }, '!build/**', '!dist/**'],
          output: ['build/**', 'dist/**'],
        },
        command: 'vp pack',
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
  test: { dir: 'src' },
})
