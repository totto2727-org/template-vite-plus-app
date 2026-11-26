import { describe, expect, test } from 'vite-plus/test'

import { greet } from './greet.ts'

describe(greet, () => {
  test('greets the world when no name is supplied', () => {
    expect(greet()).toBe('Hello, world!')
  })

  test('greets a supplied name', () => {
    expect(greet('TypeScript')).toBe('Hello, TypeScript!')
  })

  test('preserves an empty name', () => {
    expect(greet('')).toBe('Hello, !')
  })
})
