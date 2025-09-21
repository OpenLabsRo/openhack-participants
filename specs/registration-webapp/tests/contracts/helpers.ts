import fs from 'fs'
import path from 'path'
// Use namespace import for js-yaml to avoid default-import interop issues
import * as yaml from 'js-yaml'

/**
 * loadContractYaml(filePath)
 * - Robust loader that attempts several candidate locations so tests
 *   run regardless of the current working directory used by the test runner.
 * - Order of attempts:
 *   1. path relative to this helper file
 *   2. path resolved from process.cwd()
 *   3. specs/registration-webapp/contracts/<basename>
 *   4. workspace-level contracts/<basename>
 */
export function loadContractYaml(filePath: string) {
  const helpersDir = path.dirname(new URL(import.meta.url).pathname)
  const basename = path.basename(filePath)

  const candidates = [
    path.resolve(helpersDir, filePath),
    path.resolve(process.cwd(), filePath),
    path.resolve(
      process.cwd(),
      'specs/registration-webapp/contracts',
      basename
    ),
    path.resolve(process.cwd(), 'contracts', basename),
  ]

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      const txt = fs.readFileSync(candidate, 'utf8')
      return yaml.load(txt) as any
    }
  }

  // If we reach here, none of the candidates existed — throw a helpful error
  throw new Error(
    `Contract file not found. Tried: ${candidates.join(', ')}`
  )
}
