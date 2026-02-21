import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase/database.types'
import { executeWorkflow } from '@/engine/executor'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })

    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { workflowId, triggerData } = await request.json()

    if (!workflowId) {
      return NextResponse.json({ error: 'Workflow ID is required' }, { status: 400 })
    }

    // Verify user owns the workflow
    const { data: workflow, error: workflowError } = await supabase
      .from('workflows')
      .select('*')
      .eq('id', workflowId)
      .eq('user_id', session.user.id)
      .single()

    if (workflowError || !workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
    }

    // Execute the workflow
    const result = await executeWorkflow(workflowId, triggerData || {})

    return NextResponse.json({
      success: result.success,
      executionId: result.executionId,
      error: result.error
    })

  } catch (error) {
    console.error('Execute API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}