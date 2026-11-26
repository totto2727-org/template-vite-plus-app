#!/usr/bin/env node
// oxlint-disable-next-line rules/no-node-imports -- This Node.js CLI writes the greeting to standard output.
import { stdout } from 'node:process'

import { greet } from './greet.ts'

stdout.write(`${greet()}
`)
