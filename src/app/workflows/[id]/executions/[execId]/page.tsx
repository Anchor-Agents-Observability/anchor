'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/lib/supabase/database.types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatDate, formatDuration } from '@/lib/utils'
import { ArrowLeft, CheckCircle, XCircle, Clock, ChevronDown, ChevronRight } from 'lucide-react'

type Execution = Database['public']['Tables']['executions']['Row']
type StepExecution = Database['public']['Tables']['step_executions']['Row']

interface StepExecutionWithDetails extends StepExecution {
  step_name?: string
  step_type?: string
}

export default function ExecutionDetailPage() {
  const params = useParams()
  const workflowId = params.id as string
  const execId = params.execId as string

  const [execution, setExecution] = useState<Execution | null>(null)
  const [stepExecutions, setStepExecutions] = useState<StepExecutionWithDetails[]>([])
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    async function loadExecution() {
      const [executionResult, stepExecutionsResult] = await Promise.all([
        supabase
          .from('executions')
          .select('*')
          .eq('id', execId)
          .single(),
        supabase
          .from('step_executions')
          .select(`
            *,
            steps!inner (
              name,
              type
            )
          `)
          .eq('execution_id', execId)
          .order('position')
      ])

      if (executionResult.error) {
        console.error('Error loading execution:', executionResult.error)
      } else {
        setExecution(executionResult.data)
      }

      if (stepExecutionsResult.error) {
        console.error('Error loading step executions:', stepExecutionsResult.error)
      } else {
        const enrichedSteps = stepExecutionsResult.data?.map(step => ({
          ...step,
          step_name: (step.steps as any)?.name,
          step_type: (step.steps as any)?.type
        })) || []
        setStepExecutions(enrichedSteps)
      }

      setLoading(false)
    }

    loadExecution()

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('step-executions')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'step_executions',
        filter: `execution_id=eq.${execId}`
      }, () => {
        loadExecution() // Reload when step executions change
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [execId, supabase])

  const toggleStepExpansion = (stepId: string) => {
    const newExpanded = new Set(expandedSteps)
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId)
    } else {
      newExpanded.add(stepId)
    }
    setExpandedSteps(newExpanded)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'running':
        return <Clock className="w-5 h-5 text-yellow-500 animate-pulse" />
      case 'skipped':
        return <div className="w-5 h-5 rounded-full border-2 border-gray-300 bg-gray-100" />
      default:
        return <Clock className="w-5 h-5 text-gray-400" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (!execution) {
    return <div>Execution not found</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" asChild>
            <Link href={`/workflows/${workflowId}/executions`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to History
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Execution #{execution.id.slice(0, 8)}
            </h1>
            <div className="text-gray-600 mt-1">
              {formatDate(execution.started_at)}
              {execution.duration_ms && (
                <span className="ml-4">
                  Duration: {formatDuration(execution.duration_ms)}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusIcon(execution.status)}
          <span className="font-medium capitalize">{execution.status}</span>
        </div>
      </div>

      {execution.error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="text-red-800">
              <strong>Error:</strong> {execution.error}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        {/* Trigger Data */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-bold text-sm">T</span>
              </div>
              <span>Trigger</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-50 rounded-md p-4 text-sm overflow-auto">
              {JSON.stringify(execution.trigger_data, null, 2)}
            </pre>
          </CardContent>
        </Card>

        {/* Step Executions */}
        {stepExecutions.map((stepExecution, index) => {
          const isExpanded = expandedSteps.has(stepExecution.id)
          return (
            <Card key={stepExecution.id}>
              <CardHeader className="pb-3">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleStepExpansion(stepExecution.id)}
                >
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(stepExecution.status)}
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Step {stepExecution.position + 1}: {stepExecution.step_name || 'Unnamed Step'}
                      </h3>
                      <div className="text-sm text-gray-600">
                        Type: {stepExecution.step_type} • Status: {stepExecution.status}
                        {stepExecution.duration_ms && (
                          <span className="ml-2">• {formatDuration(stepExecution.duration_ms)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="pt-0 space-y-4">
                  {stepExecution.error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                      <div className="text-red-800 font-medium">Error:</div>
                      <div className="text-red-700 mt-1">{stepExecution.error}</div>
                    </div>
                  )}

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Input</h4>
                    <pre className="bg-gray-50 rounded-md p-4 text-sm overflow-auto">
                      {JSON.stringify(stepExecution.input, null, 2)}
                    </pre>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Output</h4>
                    <pre className="bg-gray-50 rounded-md p-4 text-sm overflow-auto">
                      {JSON.stringify(stepExecution.output, null, 2)}
                    </pre>
                  </div>

                  {stepExecution.started_at && stepExecution.finished_at && (
                    <div className="text-sm text-gray-600">
                      <div>Started: {formatDate(stepExecution.started_at)}</div>
                      <div>Finished: {formatDate(stepExecution.finished_at)}</div>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}