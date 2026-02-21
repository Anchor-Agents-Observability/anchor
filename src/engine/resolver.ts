import { ExecutionContext } from './types'

/**
 * Resolves variables in strings like "Hello {{trigger.name}}" or "{{step1.output.result}}"
 * Returns the resolved string with variables replaced by actual values
 */
export function resolveVariables(input: any, context: ExecutionContext): any {
  if (typeof input === 'string') {
    return resolveString(input, context)
  } else if (Array.isArray(input)) {
    return input.map(item => resolveVariables(item, context))
  } else if (input && typeof input === 'object') {
    const resolved: any = {}
    for (const [key, value] of Object.entries(input)) {
      resolved[key] = resolveVariables(value, context)
    }
    return resolved
  }
  return input
}

function resolveString(str: string, context: ExecutionContext): string {
  return str.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
    const value = getNestedValue(context, path.trim())
    return value !== undefined ? String(value) : match
  })
}

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined
  }, obj)
}