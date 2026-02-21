'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/lib/supabase/database.types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { StepCard } from '@/components/workflow/step-card'
import { AddStepButton } from '@/components/workflow/add-step-button'
import { Play, History, Link2, ArrowDown } from 'lucide-react'
import { formatDate } from '@/lib/utils'

type Workflow = Database['public']['Tables']['workflows']['Row']
type Step = Database['public']['Tables']['steps']['Row']
type Execution = Database['public']['Tables']['executions']['Row']

export default function WorkflowEditorPage() {
  const params = useParams()
  const router = useRouter()
  const workflowId = params.id as string

  const [workflow, setWorkflow] = useState<Workflow | null>(null)
  const [steps, setSteps] = useState<Step[]>([])
  const [recentExecutions, setRecentExecutions] = useState<Execution[]>([])
  const [loading, setLoading] = useState(true)
  const [workflowName, setWorkflowName] = useState('')
  const [workflowDescription, setWorkflowDescription] = useState('')

  const supabase = createClient()

  useEffect(() => {
    async function loadWorkflow() {
      const [workflowResult, stepsResult, executionsResult] = await Promise.all([
        supabase
          .from('workflows')
          .select('*')
          .eq('id', workflowId)
          .single(),
        supabase
          .from('steps')
          .select('*')
          .eq('workflow_id', workflowId)
          .order('position'),
        supabase
          .from('executions')
          .select('*')
          .eq('workflow_id', workflowId)
          .order('started_at', { ascending: false })
          .limit(5)
      ])

      if (workflowResult.error) {
        console.error('Error loading workflow:', workflowResult.error)
        router.push('/workflows')
        return
      }

      setWorkflow(workflowResult.data)
      setWorkflowName(workflowResult.data.name)
      setWorkflowDescription(workflowResult.data.description || '')
      setSteps(stepsResult.data || [])
      setRecentExecutions(executionsResult.data || [])
      setLoading(false)
    }

    loadWorkflow()
  }, [workflowId, supabase, router])

  const updateWorkflow = async (updates: Partial<Workflow>) => {
    if (!workflow) return

    const { error } = await supabase
      .from('workflows')
      .update(updates)
      .eq('id', workflow.id)

    if (error) {
      console.error('Error updating workflow:', error)
    } else {
      setWorkflow({ ...workflow, ...updates })
    }
  }

  const handleNameSave = () => {
    if (workflowName !== workflow?.name) {
      updateWorkflow({ name: workflowName })
    }
  }

  const handleDescriptionSave = () => {
    if (workflowDescription !== (workflow?.description || '')) {
      updateWorkflow({ description: workflowDescription })
    }
  }

  const addStep = async (type: string) => {
    if (!workflow) return

    const position = steps.length
    const { data, error } = await supabase
      .from('steps')
      .insert({
        workflow_id: workflow.id,
        type,
        position,
        name: `${type.charAt(0).toUpperCase() + type.slice(1)} Step`,
        config: {}
      })
      .select()
      .single()

    if (error) {
      console.error('Error adding step:', error)
    } else {
      setSteps([...steps, data])
    }
  }

  const updateStep = async (stepId: string, updates: Partial<Step>) => {
    const { error } = await supabase
      .from('steps')
      .update(updates)
      .eq('id', stepId)

    if (error) {
      console.error('Error updating step:', error)
    } else {
      setSteps(steps.map(step =>
        step.id === stepId ? { ...step, ...updates } : step
      ))
    }
  }

  const deleteStep = async (stepId: string) => {
    const { error } = await supabase
      .from('steps')
      .delete()
      .eq('id', stepId)

    if (error) {
      console.error('Error deleting step:', error)
    } else {
      setSteps(steps.filter(step => step.id !== stepId))
    }
  }

  const runWorkflow = async () => {
    if (!workflow) return

    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workflowId: workflow.id,
          triggerData: { manual: true, timestamp: new Date().toISOString() }
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to execute workflow')
      }

      const result = await response.json()
      console.log('Workflow executed:', result)

      // Refresh executions list
      const { data } = await supabase
        .from('executions')
        .select('*')
        .eq('workflow_id', workflowId)
        .order('started_at', { ascending: false })
        .limit(5)

      setRecentExecutions(data || [])
    } catch (error) {
      console.error('Error executing workflow:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (!workflow) {
    return <div>Workflow not found</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex-1 mr-8">
          <Input
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            onBlur={handleNameSave}
            className="text-2xl font-bold border-none p-0 h-auto bg-transparent focus-visible:ring-0"
            placeholder="Workflow name..."
          />
          <Input
            value={workflowDescription}
            onChange={(e) => setWorkflowDescription(e.target.value)}
            onBlur={handleDescriptionSave}
            className="text-gray-600 border-none p-0 h-auto bg-transparent focus-visible:ring-0 mt-2"
            placeholder="Add a description..."
          />
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={() => router.push(`/workflows/${workflowId}/executions`)}>
            <History className="w-4 h-4 mr-2" />
            History
          </Button>
          <Button onClick={runWorkflow}>
            <Play className="w-4 h-4 mr-2" />
            Run
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Trigger */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-md bg-blue-50 border border-blue-200">
                <Link2 className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium">Trigger</h3>
                <p className="text-sm text-gray-600 capitalize">{workflow.trigger_type}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {workflow.trigger_type === 'webhook' && (
              <div className="p-3 bg-gray-50 rounded-md">
                <div className="text-sm font-medium text-gray-700 mb-1">Webhook URL:</div>
                <div className="font-mono text-sm text-gray-600">
                  {window.location.origin}/api/webhook/{workflow.id}
                </div>
              </div>
            )}
            {workflow.trigger_type === 'manual' && (
              <div className="text-sm text-gray-600">
                This workflow runs manually when you click the "Run" button.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Steps */}
        {steps.map((step, index) => (
          <div key={step.id}>
            {index > 0 && (
              <div className="flex justify-center py-2">
                <ArrowDown className="w-4 h-4 text-gray-400" />
              </div>
            )}
            <StepCard
              step={step}
              onUpdate={updateStep}
              onDelete={deleteStep}
            />
          </div>
        ))}

        {/* Add Step Button */}
        <AddStepButton onAddStep={addStep} />

        {/* Recent Executions */}
        {recentExecutions.length > 0 && (
          <div className="pt-8 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Runs</h3>
            <div className="space-y-2">
              {recentExecutions.map((execution) => (
                <div
                  key={execution.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      execution.status === 'completed' ? 'bg-green-500' :
                      execution.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'
                    }`} />
                    <span className="text-sm font-medium capitalize">
                      {execution.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {formatDate(execution.started_at)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}