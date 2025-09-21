import fs from 'fs'
import path from 'path'
import * as yaml from 'js-yaml'
import Ajv, { ValidateFunction } from 'ajv'
import addFormats from 'ajv-formats'

const ajv = new Ajv({ strict: false })
addFormats(ajv)

// Cache of registered contract ids to avoid re-adding
const registeredContracts = new Set<string>()

function getHelpersDir() {
  return path.dirname(new URL(import.meta.url).pathname)
}

export function candidateContractPaths(basename: string) {
  const helpersDir = getHelpersDir()
  return [
    path.resolve(
      process.cwd(),
      'specs/registration-webapp/contracts',
      basename
    ),
    path.resolve(
      process.cwd(),
      'test/integration/contracts',
      basename
    ),
    path.resolve(helpersDir, basename),
    path.resolve(process.cwd(), basename),
    path.resolve(
      process.cwd(),
      '..',
      'specs/registration-webapp/contracts',
      basename
    ),
  ]
}

function loadContractYaml(filePath: string) {
  const basename = path.basename(filePath)
  const candidates = candidateContractPaths(basename)

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      const txt = fs.readFileSync(candidate, 'utf8')
      return yaml.load(txt) as any
    }
  }

  throw new Error(
    `Contract file not found. Tried: ${candidates.join(', ')}`
  )
}

// Extract response schema for an operation
function getResponseSchema(
  openapi: any,
  pathKey: string,
  method: string,
  status: string
) {
  const entry = openapi.paths?.[pathKey]?.[method?.toLowerCase()]
  if (!entry) return null
  const responses = entry.responses || {}
  const resp = responses[status] || responses['200'] || null
  if (!resp) return null
  const content = resp.content || {}
  const appjson =
    content['application/json'] || content['*/*'] || null
  if (!appjson) return null
  return appjson.schema || null
}

// Register the contract components (and optionally the full doc) with AJV once.
function registerContractWithAjv(contract: any, id: string) {
  if (!contract || registeredContracts.has(id)) return
  // Add the full contract under an $id so refs like #/components/... resolve against it.
  const toRegister = { $id: id, ...contract }
  try {
    ajv.addSchema(toRegister, id)
    registeredContracts.add(id)
  } catch (err) {
    // Non-fatal — keep going, compilation will reveal issues if any
    // but surface a helpful console message for debugging.
    // eslint-disable-next-line no-console
    console.warn(
      `Failed to register contract ${id} with AJV:`,
      (err as Error).message
    )
  }
}

export function compileSchemaFor(
  pathKey: string,
  method: string,
  status = '200'
) {
  // pick the contract file based on pathKey heuristics
  const contractFile = pathKey.startsWith('/accounts/flags')
    ? 'flags.yaml'
    : pathKey.startsWith('/accounts')
    ? 'accounts.yaml'
    : pathKey.startsWith('/teams')
    ? 'teams.yaml'
    : 'flags.yaml'

  const contract = loadContractYaml(contractFile)
  const schema = getResponseSchema(contract, pathKey, method, status)
  if (!schema) return null

  const contractId = `urn:openapi:${contractFile}`
  // Register the whole contract once so internal $ref like '#/components/schemas/Account'
  // resolve during compilation of operation schemas.
  registerContractWithAjv(contract, contractId)

  // If the operation schema contains local $ref, transform them to point to the registered id.
  // For example: '#/components/schemas/Account' -> 'urn:openapi:accounts.yaml#/components/schemas/Account'
  // This keeps the original reference structure but provides a resolvable base.
  function rewriteLocalRefs(obj: any): any {
    if (obj && typeof obj === 'object') {
      if (
        obj.$ref &&
        typeof obj.$ref === 'string' &&
        obj.$ref.startsWith('#/')
      ) {
        return { $ref: `${contractId}${obj.$ref}` }
      }
      const out: any = Array.isArray(obj) ? [] : {}
      for (const k of Object.keys(obj))
        out[k] = rewriteLocalRefs(obj[k])
      return out
    }
    return obj
  }

  const rewritten = rewriteLocalRefs(schema)

  try {
    const validator = ajv.compile(rewritten)
    return validator as ValidateFunction
  } catch (err) {
    const message = (err as Error).message || String(err)
    throw new Error(
      `AJV compile error for ${pathKey} ${method} ${status} (contract ${contractFile}): ${message}`
    )
  }
}

export function validateWithCompiled(
  validator: ValidateFunction | null,
  body: any
) {
  if (!validator) return { valid: true }
  const valid = validator(body)
  return { valid, errors: validator.errors }
}

export default {
  compileSchemaFor,
  validateWithCompiled,
  candidateContractPaths,
}
