-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create workflows table
CREATE TABLE workflows (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name        TEXT NOT NULL DEFAULT 'Untitled Workflow',
    description TEXT DEFAULT '',
    is_active   BOOLEAN DEFAULT false,
    trigger_type TEXT NOT NULL DEFAULT 'manual',  -- manual | webhook | cron
    trigger_config JSONB DEFAULT '{}',
    created_at  TIMESTAMPTZ DEFAULT now(),
    updated_at  TIMESTAMPTZ DEFAULT now()
);

-- Create steps table
CREATE TABLE steps (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    position    INTEGER NOT NULL DEFAULT 0,
    type        TEXT NOT NULL,  -- openai | http | transform | condition | email
    name        TEXT NOT NULL DEFAULT 'Untitled Step',
    config      JSONB NOT NULL DEFAULT '{}',
    created_at  TIMESTAMPTZ DEFAULT now(),
    updated_at  TIMESTAMPTZ DEFAULT now(),
    UNIQUE(workflow_id, position)
);

-- Create executions table
CREATE TABLE executions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    status      TEXT NOT NULL DEFAULT 'running',  -- running | completed | failed
    trigger_data JSONB DEFAULT '{}',
    started_at  TIMESTAMPTZ DEFAULT now(),
    finished_at TIMESTAMPTZ,
    error       TEXT,
    duration_ms INTEGER
);

-- Create step_executions table
CREATE TABLE step_executions (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    execution_id UUID NOT NULL REFERENCES executions(id) ON DELETE CASCADE,
    step_id      UUID NOT NULL REFERENCES steps(id) ON DELETE CASCADE,
    position     INTEGER NOT NULL,
    status       TEXT NOT NULL DEFAULT 'pending',  -- pending | running | completed | failed | skipped
    input        JSONB DEFAULT '{}',
    output       JSONB DEFAULT '{}',
    error        TEXT,
    started_at   TIMESTAMPTZ,
    finished_at  TIMESTAMPTZ,
    duration_ms  INTEGER
);

-- Create credentials table
CREATE TABLE credentials (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name           TEXT NOT NULL,
    type           TEXT NOT NULL,  -- openai | smtp | custom
    encrypted_data TEXT NOT NULL,
    created_at     TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE step_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE credentials ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Users can only access their own data
CREATE POLICY "Users own their workflows" ON workflows
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users access steps via workflow" ON steps
    FOR ALL USING (
        workflow_id IN (SELECT id FROM workflows WHERE user_id = auth.uid())
    );

CREATE POLICY "Users access executions via workflow" ON executions
    FOR ALL USING (
        workflow_id IN (SELECT id FROM workflows WHERE user_id = auth.uid())
    );

CREATE POLICY "Users access step_executions via execution" ON step_executions
    FOR ALL USING (
        execution_id IN (
            SELECT e.id FROM executions e
            JOIN workflows w ON e.workflow_id = w.id
            WHERE w.user_id = auth.uid()
        )
    );

CREATE POLICY "Users own their credentials" ON credentials
    FOR ALL USING (auth.uid() = user_id);

-- Enable Realtime for live execution updates
ALTER PUBLICATION supabase_realtime ADD TABLE executions;
ALTER PUBLICATION supabase_realtime ADD TABLE step_executions;

-- Create indexes for better performance
CREATE INDEX idx_workflows_user_id ON workflows(user_id);
CREATE INDEX idx_steps_workflow_id ON steps(workflow_id);
CREATE INDEX idx_executions_workflow_id ON executions(workflow_id);
CREATE INDEX idx_step_executions_execution_id ON step_executions(execution_id);
CREATE INDEX idx_credentials_user_id ON credentials(user_id);

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_workflows_updated_at BEFORE UPDATE ON workflows
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_steps_updated_at BEFORE UPDATE ON steps
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();