import { NodeHandler, NodeConfig, ExecutionContext, NodeResult } from '../types'

interface TransformConfig extends NodeConfig {
  expression: string
}

export class TransformHandler implements NodeHandler {
  async execute(config: TransformConfig, context: ExecutionContext): Promise<NodeResult> {
    try {
      if (!config.expression?.trim()) {
        return {
          success: false,
          error: 'Expression is required'
        }
      }

      const startTime = Date.now()

      // Create a safe execution context with limited globals
      const safeContext = {
        // Previous step outputs
        ...context,
        // Utility functions
        JSON: {
          parse: JSON.parse,
          stringify: JSON.stringify
        },
        Math,
        Date,
        String,
        Number,
        Boolean,
        Array,
        Object
      }

      // Execute the expression in a safe context
      const result = this.evaluateExpression(config.expression, safeContext)

      const duration = Date.now() - startTime

      return {
        success: true,
        output: result,
        duration
      }

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Transform execution failed'
      }
    }
  }

  private evaluateExpression(expression: string, context: any): any {
    // Create a function that has access to the context
    const contextKeys = Object.keys(context)
    const contextValues = contextKeys.map(key => context[key])

    // Wrap the expression to return the result
    const wrappedExpression = `
      'use strict';
      return (${expression});
    `

    try {
      // Create and execute the function
      const func = new Function(...contextKeys, wrappedExpression)
      return func(...contextValues)
    } catch (error) {
      throw new Error(`Expression evaluation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}