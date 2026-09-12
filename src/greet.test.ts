import { expect, test } from 'vite-plus/test'

import { greet } from './greet.ts'

test('greets the world when no name is supplied', () => {
  expect(greet()).toEqual('Hello, world!')
})

test('greets a supplied name', () => {
  expect(greet('TypeScript')).toEqual('Hello, TypeScript!')
})

test('preserves an empty name', () => {
  expect(greet('')).toEqual('Hello, !')
})
