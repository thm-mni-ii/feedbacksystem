import { readdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, extname, join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const extensions = new Set(['.vue', '.js', '.jsx', '.cjs', '.mjs', '.ts', '.tsx', '.cts', '.mts'])
const collect = (directory) =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    return entry.isDirectory() ? collect(path) : extensions.has(extname(path)) ? [path] : []
  })
const files = [
  ...collect(join(root, 'src')),
  ...collect(join(root, 'tests')),
  ...collect(join(root, 'evaluation'))
]
const require = createRequire(import.meta.url)
const eslint = join(dirname(require.resolve('eslint/package.json')), 'bin', 'eslint.js')
const result = spawnSync(process.execPath, [eslint, ...files, ...process.argv.slice(2)], {
  cwd: root,
  stdio: 'inherit'
})
if (result.error) throw result.error
process.exitCode = result.status ?? 1
