export interface ExecutionContext {
  trigger: any
  [key: string]: any // step outputs: step1, step2, etc.
}

export interface NodeConfig {
  [key: string]: any
}

export interface NodeResult {
  success: boolean
  output?: any
  error?: string
  duration?: number
}

export interface NodeHandler {
  execute(config: NodeConfig, context: ExecutionContext): Promise<NodeResult>
}

export interface ExecutionResult {
  success: boolean
  executionId: string
  error?: string
}