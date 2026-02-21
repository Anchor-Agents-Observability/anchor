export type Database = {
  public: {
    Tables: {
      workflows: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          is_active: boolean
          trigger_type: string
          trigger_config: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name?: string
          description?: string | null
          is_active?: boolean
          trigger_type?: string
          trigger_config?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          is_active?: boolean
          trigger_type?: string
          trigger_config?: any
          created_at?: string
          updated_at?: string
        }
      }
      steps: {
        Row: {
          id: string
          workflow_id: string
          position: number
          type: string
          name: string
          config: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workflow_id: string
          position?: number
          type: string
          name?: string
          config?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          workflow_id?: string
          position?: number
          type?: string
          name?: string
          config?: any
          created_at?: string
          updated_at?: string
        }
      }
      executions: {
        Row: {
          id: string
          workflow_id: string
          status: string
          trigger_data: any
          started_at: string
          finished_at: string | null
          error: string | null
          duration_ms: number | null
        }
        Insert: {
          id?: string
          workflow_id: string
          status?: string
          trigger_data?: any
          started_at?: string
          finished_at?: string | null
          error?: string | null
          duration_ms?: number | null
        }
        Update: {
          id?: string
          workflow_id?: string
          status?: string
          trigger_data?: any
          started_at?: string
          finished_at?: string | null
          error?: string | null
          duration_ms?: number | null
        }
      }
      step_executions: {
        Row: {
          id: string
          execution_id: string
          step_id: string
          position: number
          status: string
          input: any
          output: any
          error: string | null
          started_at: string | null
          finished_at: string | null
          duration_ms: number | null
        }
        Insert: {
          id?: string
          execution_id: string
          step_id: string
          position: number
          status?: string
          input?: any
          output?: any
          error?: string | null
          started_at?: string | null
          finished_at?: string | null
          duration_ms?: number | null
        }
        Update: {
          id?: string
          execution_id?: string
          step_id?: string
          position?: number
          status?: string
          input?: any
          output?: any
          error?: string | null
          started_at?: string | null
          finished_at?: string | null
          duration_ms?: number | null
        }
      }
      credentials: {
        Row: {
          id: string
          user_id: string
          name: string
          type: string
          encrypted_data: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type: string
          encrypted_data: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          type?: string
          encrypted_data?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}