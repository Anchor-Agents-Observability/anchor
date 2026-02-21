import { NodeHandler, NodeConfig, ExecutionContext, NodeResult } from '../types'

interface ConditionConfig extends NodeConfig {
  expression: string
  skipCount?: number
}

export class ConditionHandler implements NodeHandler {
  async execute(config: ConditionConfig, context: ExecutionContext): Promise<NodeResult> {
    try {
      if (!config.expression?.trim()) {
        return {
          success: false,
          error: 'Condition expression is required'
        }
      }

      const startTime = Date.now()

      // Create a safe execution context
      const safeContext = {
        ...context,
        // Utility functions for conditions
        Math,
        Date,
        String,
        Number,
        Boolean,
        Array,
        Object
      }

      // Evaluate the condition
      const result = this.evaluateCondition(config.expression, safeContext)

      const duration = Date.now() - startTime

      // The condition result determines if next steps should be skipped
      return {
        success: true,
        output: {
          result: Boolean(result),
          expression: config.expression,
          skipCount: config.skipCount || 1
        },
        duration
      }

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Condition evaluation failed'
      }
    }
  }

  private evaluateCondition(expression: string, context: any): boolean {
    // Create a function that has access to the context
    const contextKeys = Object.keys(context)
    const contextValues = contextKeys.map(key => context[key])

    // Wrap the expression to return a boolean result
    const wrappedExpression = `
      'use strict';
      return Boolean(${expression});
    `

    try {
      // Create and execute the function
      const func = new Function(...contextKeys, wrappedExpression)
      return func(...contextValues)
    } catch (error) {
      throw new Error(`Condition evaluation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}