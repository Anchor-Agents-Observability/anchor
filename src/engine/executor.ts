import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase/database.types'
import { ExecutionContext, ExecutionResult } from './types'
import { resolveVariables } from './resolver'
import { getNodeHandler } from './nodes'

type Step = Database['public']['Tables']['steps']['Row']
type Execution = Database['public']['Tables']['executions']['Row']
type StepExecution = Database['public']['Tables']['step_executions']['Row']

export async function executeWorkflow(
  workflowId: string,
  triggerData: any
): Promise<ExecutionResult> {
  const supabase = createServerComponentClient<Database>({ cookies })

  try {
    // 1. Load workflow and steps
    const [workflowResult, stepsResult] = await Promise.all([
      supabase
        .from('workflows')
        .select('*')
        .eq('id', workflowId)
        .single(),
      supabase
        .from('steps')
        .select('*')
        .eq('workflow_id', workflowId)
        .order('position')
    ])

    if (workflowResult.error) {
      throw new Error(`Workflow not found: ${workflowResult.error.message}`)
    }

    const steps = stepsResult.data || []

    // 2. Create execution record
    const { data: execution, error: executionError } = await supabase
      .from('executions')
      .insert({
        workflow_id: workflowId,
        status: 'running',
        trigger_data: triggerData,
        started_at: new Date().toISOString()
      })
      .select()
      .single()

    if (executionError) {
      throw new Error(`Failed to create execution: ${executionError.message}`)
    }

    // 3. Build initial context
    const context: ExecutionContext = {
      trigger: triggerData
    }

    const startTime = Date.now()
    let skipCount = 0

    // 4. Execute each step
    for (const step of steps) {
      // Handle skipping (from condition nodes)
      if (skipCount > 0) {
        await createStepExecution(supabase, execution.id, step, 'skipped', {}, {})
        skipCount--
        continue
      }

      // Create step execution record
      const { data: stepExecution, error: stepError } = await supabase
        .from('step_executions')
        .insert({
          execution_id: execution.id,
          step_id: step.id,
          position: step.position,
          status: 'running',
          started_at: new Date().toISOString()
        })
        .select()
        .single()

      if (stepError) {
        console.error('Error creating step execution:', stepError)
        continue
      }

      try {
        // Resolve variables in step config
        const resolvedConfig = resolveVariables(step.config, context)

        // Get the node handler
        const handler = getNodeHandler(step.type)
        if (!handler) {
          throw new Error(`Unknown step type: ${step.type}`)
        }

        // Execute the step
        const stepStart = Date.now()
        const result = await handler.execute(resolvedConfig, context)
        const stepDuration = Date.now() - stepStart

        if (result.success) {
          // Update step execution with success
          await supabase
            .from('step_executions')
            .update({
              status: 'completed',
              input: resolvedConfig,
              output: result.output,
              finished_at: new Date().toISOString(),
              duration_ms: stepDuration
            })
            .eq('id', stepExecution.id)

          // Add output to context for next steps
          context[`step${step.position + 1}`] = { output: result.output }

          // Handle condition node (sets skipCount)
          if (step.type === 'condition' && result.output && !result.output.result) {
            skipCount = step.config.skipCount || 1
          }
        } else {
          // Update step execution with error
          await supabase
            .from('step_executions')
            .update({
              status: 'failed',
              input: resolvedConfig,
              error: result.error,
              finished_at: new Date().toISOString(),
              duration_ms: stepDuration
            })
            .eq('id', stepExecution.id)

          // Update main execution as failed and stop
          const totalDuration = Date.now() - startTime
          await supabase
            .from('executions')
            .update({
              status: 'failed',
              error: `Failed at step ${step.position + 1}: ${result.error}`,
              finished_at: new Date().toISOString(),
              duration_ms: totalDuration
            })
            .eq('id', execution.id)

          return {
            success: false,
            executionId: execution.id,
            error: result.error
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'

        // Update step execution with error
        await supabase
          .from('step_executions')
          .update({
            status: 'failed',
            error: errorMessage,
            finished_at: new Date().toISOString()
          })
          .eq('id', stepExecution.id)

        // Update main execution as failed and stop
        const totalDuration = Date.now() - startTime
        await supabase
          .from('executions')
          .update({
            status: 'failed',
            error: `Failed at step ${step.position + 1}: ${errorMessage}`,
            finished_at: new Date().toISOString(),
            duration_ms: totalDuration
          })
          .eq('id', execution.id)

        return {
          success: false,
          executionId: execution.id,
          error: errorMessage
        }
      }
    }

    // 5. Mark execution as completed
    const totalDuration = Date.now() - startTime
    await supabase
      .from('executions')
      .update({
        status: 'completed',
        finished_at: new Date().toISOString(),
        duration_ms: totalDuration
      })
      .eq('id', execution.id)

    return {
      success: true,
      executionId: execution.id
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Workflow execution error:', error)

    return {
      success: false,
      executionId: '',
      error: errorMessage
    }
  }
}

async function createStepExecution(
  supabase: any,
  executionId: string,
  step: Step,
  status: string,
  input: any,
  output: any
) {
  await supabase
    .from('step_executions')
    .insert({
      execution_id: executionId,
      step_id: step.id,
      position: step.position,
      status,
      input,
      output,
      started_at: status === 'skipped' ? null : new Date().toISOString(),
      finished_at: status === 'skipped' ? null : new Date().toISOString()
    })
}