'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/lib/supabase/database.types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatDate, formatDuration } from '@/lib/utils'
import { ArrowLeft, CheckCircle, XCircle, Clock, Play } from 'lucide-react'

type Execution = Database['public']['Tables']['executions']['Row']

export default function ExecutionHistoryPage() {
  const params = useParams()
  const workflowId = params.id as string

  const [executions, setExecutions] = useState<Execution[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    async function loadExecutions() {
      const { data, error } = await supabase
        .from('executions')
        .select('*')
        .eq('workflow_id', workflowId)
        .order('started_at', { ascending: false })

      if (error) {
        console.error('Error loading executions:', error)
      } else {
        setExecutions(data || [])
      }
      setLoading(false)
    }

    loadExecutions()

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('executions')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'executions',
        filter: `workflow_id=eq.${workflowId}`
      }, () => {
        loadExecutions() // Reload when executions change
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [workflowId, supabase])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'running':
        return <Clock className="w-5 h-5 text-yellow-500 animate-pulse" />
      default:
        return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-700 bg-green-50 border-green-200'
      case 'failed':
        return 'text-red-700 bg-red-50 border-red-200'
      case 'running':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200'
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200'
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
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" asChild>
            <Link href={`/workflows/${workflowId}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Editor
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Execution History</h1>
            <p className="text-gray-600">View all workflow runs and their results</p>
          </div>
        </div>
      </div>

      {executions.length === 0 ? (
        <div className="text-center py-12">
          <Play className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No executions yet</h3>
          <p className="text-gray-600 mb-4">Run your workflow to see execution history</p>
          <Button asChild>
            <Link href={`/workflows/${workflowId}`}>Go to Editor</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {executions.map((execution) => (
            <Card key={execution.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(execution.status)}
                    <div>
                      <div className="flex items-center space-x-3">
                        <h3 className="font-medium text-gray-900">
                          Execution #{execution.id.slice(0, 8)}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(execution.status)}`}>
                          {execution.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Started: {formatDate(execution.started_at)}
                        {execution.duration_ms && (
                          <span className="ml-4">
                            Duration: {formatDuration(execution.duration_ms)}
                          </span>
                        )}
                      </div>
                      {execution.error && (
                        <div className="text-sm text-red-600 mt-1">
                          Error: {execution.error}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button variant="outline" asChild>
                    <Link href={`/workflows/${workflowId}/executions/${execution.id}`}>
                      View Details
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}