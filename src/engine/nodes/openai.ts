import OpenAI from 'openai'
import { NodeHandler, NodeConfig, ExecutionContext, NodeResult } from '../types'

interface OpenAIConfig extends NodeConfig {
  model: string
  systemPrompt?: string
  userPrompt: string
  maxTokens?: number
  temperature?: number
  apiKey: string
}

export class OpenAIHandler implements NodeHandler {
  async execute(config: OpenAIConfig, context: ExecutionContext): Promise<NodeResult> {
    try {
      if (!config.apiKey) {
        return {
          success: false,
          error: 'OpenAI API key is required'
        }
      }

      if (!config.userPrompt) {
        return {
          success: false,
          error: 'User prompt is required'
        }
      }

      const client = new OpenAI({
        apiKey: config.apiKey
      })

      const messages: any[] = []

      if (config.systemPrompt?.trim()) {
        messages.push({
          role: 'system',
          content: config.systemPrompt
        })
      }

      messages.push({
        role: 'user',
        content: config.userPrompt
      })

      const startTime = Date.now()

      const response = await client.chat.completions.create({
        model: config.model || 'gpt-3.5-turbo',
        messages,
        max_tokens: config.maxTokens || 1000,
        temperature: config.temperature || 1
      })

      const duration = Date.now() - startTime

      const result = response.choices[0]?.message?.content
      if (!result) {
        return {
          success: false,
          error: 'No response from OpenAI'
        }
      }

      // Calculate estimated cost (rough approximation)
      const inputTokens = response.usage?.prompt_tokens || 0
      const outputTokens = response.usage?.completion_tokens || 0
      const cost = this.calculateCost(config.model, inputTokens, outputTokens)

      return {
        success: true,
        output: {
          content: result,
          model: response.model,
          tokens: {
            input: inputTokens,
            output: outputTokens,
            total: response.usage?.total_tokens || 0
          },
          cost,
          finishReason: response.choices[0]?.finish_reason,
          responseId: response.id
        },
        duration
      }

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown OpenAI error'
      }
    }
  }

  private calculateCost(model: string, inputTokens: number, outputTokens: number): number {
    // Rough cost estimates (per 1K tokens) as of 2024
    const costs: Record<string, { input: number; output: number }> = {
      'gpt-4': { input: 0.03, output: 0.06 },
      'gpt-4-turbo': { input: 0.01, output: 0.03 },
      'gpt-4o': { input: 0.005, output: 0.015 },
      'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
      'gpt-3.5-turbo': { input: 0.001, output: 0.002 }
    }

    const modelCost = costs[model] || costs['gpt-3.5-turbo']
    return ((inputTokens / 1000) * modelCost.input) + ((outputTokens / 1000) * modelCost.output)
  }
}