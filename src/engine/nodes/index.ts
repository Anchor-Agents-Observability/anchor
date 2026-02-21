import { NodeHandler } from '../types'
import { OpenAIHandler } from './openai'
import { HttpHandler } from './http-request'
import { TransformHandler } from './transform'
import { ConditionHandler } from './condition'
import { EmailHandler } from './email'

const nodeHandlers: Record<string, NodeHandler> = {
  openai: new OpenAIHandler(),
  http: new HttpHandler(),
  transform: new TransformHandler(),
  condition: new ConditionHandler(),
  email: new EmailHandler(),
}

export function getNodeHandler(type: string): NodeHandler | null {
  return nodeHandlers[type] || null
}