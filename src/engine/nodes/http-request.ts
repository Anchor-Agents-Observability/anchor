import { NodeHandler, NodeConfig, ExecutionContext, NodeResult } from '../types'

interface HttpConfig extends NodeConfig {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  url: string
  headers?: Record<string, string>
  body?: string | object
  responseType?: 'json' | 'text'
}

export class HttpHandler implements NodeHandler {
  async execute(config: HttpConfig, context: ExecutionContext): Promise<NodeResult> {
    try {
      if (!config.url) {
        return {
          success: false,
          error: 'URL is required'
        }
      }

      const method = config.method || 'GET'
      const headers: Record<string, string> = {
        'User-Agent': 'Anchor-Workflows/1.0',
        ...config.headers
      }

      let body: string | undefined
      if (config.body && ['POST', 'PUT', 'PATCH'].includes(method)) {
        if (typeof config.body === 'object') {
          body = JSON.stringify(config.body)
          headers['Content-Type'] = headers['Content-Type'] || 'application/json'
        } else {
          body = config.body
        }
      }

      const startTime = Date.now()

      const response = await fetch(config.url, {
        method,
        headers,
        body,
        // Add timeout
        signal: AbortSignal.timeout(30000) // 30 second timeout
      })

      const duration = Date.now() - startTime

      const responseHeaders: Record<string, string> = {}
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value
      })

      let responseBody: any
      const contentType = response.headers.get('content-type') || ''

      if (config.responseType === 'text' || contentType.includes('text/')) {
        responseBody = await response.text()
      } else if (contentType.includes('application/json')) {
        try {
          responseBody = await response.json()
        } catch {
          responseBody = await response.text()
        }
      } else {
        responseBody = await response.text()
      }

      return {
        success: response.ok,
        output: {
          status: response.status,
          statusText: response.statusText,
          headers: responseHeaders,
          body: responseBody,
          ok: response.ok
        },
        duration,
        error: !response.ok ? `HTTP ${response.status}: ${response.statusText}` : undefined
      }

    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            success: false,
            error: 'Request timed out'
          }
        }
        return {
          success: false,
          error: error.message
        }
      }
      return {
        success: false,
        error: 'Unknown HTTP error'
      }
    }
  }
}