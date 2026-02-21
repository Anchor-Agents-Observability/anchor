import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase/database.types'
import { executeWorkflow } from '@/engine/executor'

interface Params {
  workflowId: string
}

export async function POST(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { workflowId } = params

    if (!workflowId) {
      return NextResponse.json({ error: 'Workflow ID is required' }, { status: 400 })
    }

    const supabase = createServerComponentClient<Database>({ cookies })

    // Check if workflow exists and is active
    const { data: workflow, error: workflowError } = await supabase
      .from('workflows')
      .select('*')
      .eq('id', workflowId)
      .eq('trigger_type', 'webhook')
      .eq('is_active', true)
      .single()

    if (workflowError || !workflow) {
      return NextResponse.json({ error: 'Workflow not found or inactive' }, { status: 404 })
    }

    // Get request body and headers as trigger data
    let body: any = {}
    const contentType = request.headers.get('content-type') || ''

    if (contentType.includes('application/json')) {
      try {
        body = await request.json()
      } catch {
        body = {}
      }
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData()
      body = Object.fromEntries(formData.entries())
    } else {
      try {
        body = { text: await request.text() }
      } catch {
        body = {}
      }
    }

    const triggerData = {
      webhook: true,
      timestamp: new Date().toISOString(),
      headers: Object.fromEntries(request.headers.entries()),
      body,
      url: request.url,
      method: request.method
    }

    // Execute the workflow
    const result = await executeWorkflow(workflowId, triggerData)

    if (result.success) {
      return NextResponse.json({
        success: true,
        executionId: result.executionId,
        message: 'Workflow executed successfully'
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Webhook API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}