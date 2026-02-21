'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/lib/supabase/database.types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'
import { FileText, Plus, Play, Clock, CheckCircle, XCircle } from 'lucide-react'

type Workflow = Database['public']['Tables']['workflows']['Row']

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadWorkflows() {
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .order('updated_at', { ascending: false })

      if (error) {
        console.error('Error loading workflows:', error)
      } else {
        setWorkflows(data || [])
      }
      setLoading(false)
    }

    loadWorkflows()
  }, [supabase])

  const createWorkflow = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('workflows')
      .insert({
        user_id: user.id,
        name: 'Untitled Workflow',
        description: '',
        trigger_type: 'manual'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating workflow:', error)
    } else {
      setWorkflows([data, ...workflows])
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workflows</h1>
          <p className="text-gray-600 mt-1">Create and manage your AI workflows</p>
        </div>
        <Button onClick={createWorkflow}>
          <Plus className="w-4 h-4 mr-2" />
          New Workflow
        </Button>
      </div>

      {workflows.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No workflows yet</h3>
          <p className="text-gray-600 mb-4">Get started by creating your first workflow</p>
          <Button onClick={createWorkflow}>
            <Plus className="w-4 h-4 mr-2" />
            Create Workflow
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workflows.map((workflow) => (
            <Link key={workflow.id} href={`/workflows/${workflow.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <FileText className="w-5 h-5 text-blue-600 mt-1" />
                    <div className="flex items-center space-x-2">
                      {workflow.is_active ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <Clock className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                  <CardTitle className="text-lg">{workflow.name}</CardTitle>
                  {workflow.description && (
                    <CardDescription>{workflow.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center justify-between">
                      <span>Trigger:</span>
                      <span className="capitalize">{workflow.trigger_type}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Updated:</span>
                      <span>{formatDate(workflow.updated_at)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}