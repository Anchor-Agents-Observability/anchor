# Anchor Workflows — MVP Build Plan

## Product Vision

Build an n8n competitor for AI workflows that feels like Notion — clean, linear, document-style workflow editor with best-in-class execution visibility. Every workflow step shows exactly what went in, what came out, why it failed.

**One-liner:** "AI workflow automation where you can see everything."

**Target user:** Developer building AI-powered automations (content pipelines, data extraction, chatbot flows, AI agents).

**NOT:** General-purpose automation for marketing/ops teams. Not no-code. Low-code for devs.

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Runtime | **Bun** | Fast installs, native TypeScript, fast startup |
| Framework | **Next.js 14** (App Router) | Full-stack React, Vercel deploy, huge ecosystem |
| UI | **shadcn/ui + Tailwind CSS** | Notion-like aesthetic out of the box |
| Backend | **Supabase** | Managed Postgres + Auth + Realtime — skip building infrastructure |
| Auth | **Supabase Auth** | Email + OAuth (Google/GitHub), free tier |
| Realtime | **Supabase Realtime** | Live execution updates without building WebSocket server |
| Deploy | **Vercel** (frontend) + **Supabase** (backend) | One-click deploy, zero DevOps |

---

## Architecture & Data Flow

### High-Level Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        VERCEL                                │
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                   Next.js App                           │ │
│  │                                                         │ │
│  │  ┌──────────┐  ┌──────────────┐  ┌──────────────────┐  │ │
│  │  │ Workflow  │  │  Execution   │  │   API Routes     │  │ │
│  │  │ Editor   │  │  Viewer      │  │   /api/execute   │  │ │
│  │  │ (pages)  │  │  (pages)     │  │   /api/webhook   │  │ │
│  │  └────┬─────┘  └──────┬───────┘  └────────┬─────────┘  │ │
│  │       │               │                    │            │ │
│  │       └───────────────┴────────────────────┘            │ │
│  │                        │                                │ │
│  │              Supabase JS Client                         │ │
│  └──────────────────────────┬──────────────────────────────┘ │
└─────────────────────────────┼────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                       SUPABASE                               │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │  PostgreSQL   │  │  Auth        │  │  Realtime        │   │
│  │              │  │              │  │                  │   │
│  │  - workflows │  │  - users     │  │  - execution     │   │
│  │  - steps     │  │  - sessions  │  │    status updates│   │
│  │  - executions│  │  - OAuth     │  │  - live step     │   │
│  │  - step_exec │  │              │  │    results       │   │
│  │  - credentials│ │              │  │                  │   │
│  └──────────────┘  └──────────────┘  └──────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

### Workflow Execution Data Flow

```
User clicks [▶ Run] or Webhook fires
         │
         ▼
┌─────────────────────────┐
│  API Route: /api/execute │
│                         │
│  1. Load workflow + steps│
│  2. Create Execution row │  ──→ Supabase Realtime broadcasts
│     (status: running)   │       "execution started" to UI
│                         │
│  3. For each step:      │
│     ┌─────────────────┐ │
│     │ a. Resolve vars  │ │  Parse {{step1.output.x}} → actual values
│     │ b. Run node      │ │  Call OpenAI / HTTP / transform / etc.
│     │ c. Save result   │ │  ──→ StepExecution row (input, output, duration)
│     │                  │ │  ──→ Supabase Realtime broadcasts
│     │                  │ │       "step completed" to UI
│     │ d. If error:     │ │
│     │    save error,   │ │
│     │    stop workflow  │ │
│     └─────────────────┘ │
│                         │
│  4. Update Execution    │  ──→ Supabase Realtime broadcasts
│     (status: completed  │       "execution done" to UI
│      or failed)         │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│  UI receives realtime   │
│  updates:               │
│                         │
│  • Step 1 card → ✅     │
│  • Step 2 card → ✅     │
│  • Step 3 card → ❌     │
│  • Click any step →     │
│    see full input/output │
└─────────────────────────┘
```

### Variable Resolution Flow

```
User writes in Step 2 config:
  "Summarize: {{trigger.body.text}}"

         │
         ▼
┌─────────────────────────────────────────┐
│  Variable Resolver                      │
│                                         │
│  Context map built during execution:    │
│  {                                      │
│    "trigger": {                         │
│      "body": { "text": "Article..." }   │
│    },                                   │
│    "step1": {                           │
│      "output": { "content": "..." }     │
│    }                                    │
│  }                                      │
│                                         │
│  Regex finds {{trigger.body.text}}      │
│  Resolves to → "Article about AI..."    │
│                                         │
│  Final prompt:                          │
│  "Summarize: Article about AI..."       │
└─────────────────────────────────────────┘
```

---

## Database Schema

```sql
-- Users are managed by Supabase Auth (auth.users table)
-- These are the application tables:

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

CREATE TABLE credentials (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name           TEXT NOT NULL,
    type           TEXT NOT NULL,  -- openai | smtp | custom
    encrypted_data TEXT NOT NULL,
    created_at     TIMESTAMPTZ DEFAULT now()
);

-- Row Level Security (Supabase)
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE step_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE credentials ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
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
```

---

## Project Structure

```
app/
├── bun.lockb
├── package.json
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── .env.local                          # NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
│
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql      # Schema above
│
├── public/
│   └── logo.svg
│
├── src/
│   ├── app/                            # Next.js App Router (pages)
│   │   ├── layout.tsx                  # Root layout: sidebar + main area
│   │   ├── page.tsx                    # Dashboard: redirect to /workflows
│   │   │
│   │   ├── login/
│   │   │   └── page.tsx               # Login/signup page (Supabase Auth UI)
│   │   │
│   │   ├── workflows/
│   │   │   ├── page.tsx               # Workflow list (cards grid)
│   │   │   └── [id]/
│   │   │       ├── page.tsx           # ★ Workflow editor (THE main page)
│   │   │       └── executions/
│   │   │           ├── page.tsx       # Execution history list
│   │   │           └── [execId]/
│   │   │               └── page.tsx   # ★ Execution detail (input/output viewer)
│   │   │
│   │   ├── credentials/
│   │   │   └── page.tsx               # Manage API keys
│   │   │
│   │   └── api/
│   │       ├── execute/
│   │       │   └── route.ts           # POST: run a workflow
│   │       └── webhook/
│   │           └── [workflowId]/
│   │               └── route.ts       # POST: webhook trigger endpoint
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── sidebar.tsx            # Notion-style left sidebar
│   │   │   ├── topbar.tsx             # Workflow name + run button
│   │   │   └── auth-guard.tsx         # Redirect if not logged in
│   │   │
│   │   ├── workflow/
│   │   │   ├── workflow-editor.tsx     # Main editor: list of step cards
│   │   │   ├── step-card.tsx          # Single step block (collapsed/expanded)
│   │   │   ├── step-config/
│   │   │   │   ├── openai-config.tsx  # Config form for OpenAI node
│   │   │   │   ├── http-config.tsx    # Config form for HTTP Request node
│   │   │   │   ├── transform-config.tsx
│   │   │   │   ├── condition-config.tsx
│   │   │   │   └── email-config.tsx
│   │   │   ├── trigger-config.tsx     # Trigger setup (webhook URL, cron, manual)
│   │   │   ├── add-step-button.tsx    # "+" button with node picker dropdown
│   │   │   └── variable-input.tsx     # Text input with {{variable}} autocomplete
│   │   │
│   │   ├── execution/
│   │   │   ├── execution-list.tsx     # Table of recent runs
│   │   │   ├── execution-detail.tsx   # Full view: every step with input/output
│   │   │   ├── step-result-card.tsx   # Single step result (input + output + timing)
│   │   │   └── live-indicator.tsx     # Animated dot showing step is running
│   │   │
│   │   └── ui/                        # shadcn/ui components (auto-generated)
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── input.tsx
│   │       ├── select.tsx
│   │       ├── textarea.tsx
│   │       ├── badge.tsx
│   │       ├── separator.tsx
│   │       └── tooltip.tsx
│   │
│   ├── engine/                        # Workflow execution logic (runs server-side)
│   │   ├── executor.ts                # Core: loads workflow → runs steps → saves results
│   │   ├── resolver.ts                # Parses {{variables}} → replaces with real values
│   │   ├── types.ts                   # TypeScript types for nodes, configs, results
│   │   └── nodes/
│   │       ├── index.ts              # Node registry: maps type string → handler function
│   │       ├── openai.ts             # OpenAI chat completion node
│   │       ├── http-request.ts       # Generic HTTP request node
│   │       ├── transform.ts          # JSON transformation / data mapping
│   │       ├── condition.ts          # If/else (evaluate expression → skip next or continue)
│   │       └── email.ts              # Send email via SMTP/Resend
│   │
│   └── lib/
│       ├── supabase/
│       │   ├── client.ts             # Browser Supabase client
│       │   ├── server.ts             # Server-side Supabase client
│       │   └── middleware.ts         # Auth middleware for protected routes
│       ├── crypto.ts                 # Encrypt/decrypt credentials (AES-256)
│       └── utils.ts                  # Shared helpers (cn, formatDate, etc.)
│
└── MVP_PLAN.md                        # This file
```

---

## UI Design Specification

### Design Principles (Notion-like)

1. **White/light gray background** — no dark sidebars, no heavy borders
2. **System font stack** — Inter or default sans-serif, clean typography
3. **Generous whitespace** — 16-24px padding, steps feel spacious
4. **Minimal chrome** — no toolbars, no ribbons, no tab bars
5. **Inline editing** — click to edit, no modals for configuration
6. **Subtle animations** — smooth expand/collapse, gentle hover states
7. **Muted colors** — accent color only for primary actions, status indicators

### Color Palette

```
Background:     #FFFFFF (white)
Surface:        #F9FAFB (gray-50, for cards)
Border:         #E5E7EB (gray-200)
Text primary:   #111827 (gray-900)
Text secondary: #6B7280 (gray-500)
Accent:         #2563EB (blue-600, for buttons and links)
Success:        #10B981 (green-500)
Error:          #EF4444 (red-500)
Warning:        #F59E0B (amber-500)
Node icons:
  OpenAI:       #10A37F (green)
  HTTP:         #6366F1 (indigo)
  Transform:    #8B5CF6 (violet)
  Condition:    #F59E0B (amber)
  Email:        #EC4899 (pink)
```

### Page: Workflow List (`/workflows`)

```
┌─────────────────────────────────────────────────────────────────┐
│ ┌─────────┐                                                    │
│ │         │  Workflows                    [ + New Workflow ]    │
│ │ Anchor  │                                                    │
│ │         │ ┌───────────────────┐ ┌───────────────────┐        │
│ │─────────│ │ 📄                │ │ 📄                │        │
│ │         │ │ AI Content Writer │ │ Data Extractor    │        │
│ │ 📋 All  │ │ 4 steps           │ │ 3 steps           │        │
│ │         │ │ Last run: 2m ago  │ │ Last run: 1h ago  │        │
│ │ 📊 Runs │ │ ✅ passing        │ │ ❌ failing        │        │
│ │         │ └───────────────────┘ └───────────────────┘        │
│ │ 🔑 Keys │                                                    │
│ │         │ ┌───────────────────┐                              │
│ │         │ │ 📄                │                              │
│ │         │ │ Email Summarizer  │                              │
│ │         │ │ 2 steps           │                              │
│ │         │ │ Never run         │                              │
│ │         │ └───────────────────┘                              │
│ └─────────┘                                                    │
└─────────────────────────────────────────────────────────────────┘
```

### Page: Workflow Editor (`/workflows/[id]`) — THE MAIN PAGE

```
┌─────────────────────────────────────────────────────────────────┐
│ ┌─────────┐                                                    │
│ │         │  AI Content Writer              [▶ Run] [History]  │
│ │ Anchor  │  Add a description...                              │
│ │         │                                                    │
│ │─────────│ ─────────────────────────────────────────────────  │
│ │         │                                                    │
│ │ 📋 All  │  TRIGGER                                           │
│ │  ▸ AI.. │  ┌──────────────────────────────────────────────┐  │
│ │  ▸ Data │  │  🔗 Webhook                                  │  │
│ │  ▸ Email│  │  https://anchor.dev/wh/abc123          [📋]  │  │
│ │         │  └──────────────────────────────────────────────┘  │
│ │ 📊 Runs │                    │                               │
│ │         │  STEP 1                                            │
│ │ 🔑 Keys │  ┌──────────────────────────────────────────────┐  │
│ │         │  │  🤖 OpenAI Chat                        ☰  ✕  │  │
│ │         │  │                                              │  │
│ │         │  │  Model       gpt-4o                  ▾       │  │
│ │         │  │  System      You are a helpful writer        │  │
│ │         │  │  Prompt      Summarize this article:         │  │
│ │         │  │              {{trigger.body.text}}            │  │
│ │         │  │  Max tokens  500                              │  │
│ │         │  │  API Key     My OpenAI Key            ▾       │  │
│ │         │  └──────────────────────────────────────────────┘  │
│ │         │                    │                               │
│ │         │  STEP 2                                            │
│ │         │  ┌──────────────────────────────────────────────┐  │
│ │         │  │  📧 Send Email                         ☰  ✕  │  │
│ │         │  │                                              │  │
│ │         │  │  To          {{trigger.body.email}}           │  │
│ │         │  │  Subject     Your summary is ready            │  │
│ │         │  │  Body        {{step1.output.content}}         │  │
│ │         │  └──────────────────────────────────────────────┘  │
│ │         │                                                    │
│ │         │             [ + Add step ]                         │
│ │         │                                                    │
│ │         │  ── Recent Runs ──────────────────────────────     │
│ │         │  ✅ 2 min ago   1.5s   2 steps   completed       │
│ │         │  ❌ 1 hr ago    0.8s   failed at step 1          │
│ │         │  ✅ 2 hr ago    2.1s   2 steps   completed       │
│ └─────────┘                                                    │
└─────────────────────────────────────────────────────────────────┘
```

### Page: Execution Detail (`/workflows/[id]/executions/[execId]`)

```
┌─────────────────────────────────────────────────────────────────┐
│ ┌─────────┐                                                    │
│ │         │  ← Back to AI Content Writer                       │
│ │ Anchor  │  Execution #42        ✅ Completed        1.5s    │
│ │         │  Feb 21, 2026 3:42 PM                              │
│ │─────────│                                                    │
│ │         │ ─────────────────────────────────────────────────  │
│ │ 📋 All  │                                                    │
│ │         │  🔗 TRIGGER                                  0ms   │
│ │ 📊 Runs │  ┌─ Input ────────────────────────────────────┐   │
│ │         │  │ {                                          │   │
│ │ 🔑 Keys │  │   "body": {                               │   │
│ │         │  │     "text": "OpenAI announced GPT-5...",   │   │
│ │         │  │     "email": "user@example.com"            │   │
│ │         │  │   }                                        │   │
│ │         │  │ }                                          │   │
│ │         │  └────────────────────────────────────────────┘   │
│ │         │                    │                               │
│ │         │  🤖 STEP 1: OpenAI Chat                 1.2s  ✅  │
│ │         │  ┌─ Input ────────────────────────────────────┐   │
│ │         │  │ Model: gpt-4o                              │   │
│ │         │  │ Prompt: "Summarize this article:           │   │
│ │         │  │   OpenAI announced GPT-5..."               │   │
│ │         │  └────────────────────────────────────────────┘   │
│ │         │  ┌─ Output ───────────────────────────────────┐   │
│ │         │  │ {                                          │   │
│ │         │  │   "content": "OpenAI has released GPT-5,   │   │
│ │         │  │     their most advanced model yet...",      │   │
│ │         │  │   "model": "gpt-4o-2024-08-06",           │   │
│ │         │  │   "tokens": { "in": 120, "out": 85 },     │   │
│ │         │  │   "cost": "$0.003"                         │   │
│ │         │  │ }                                          │   │
│ │         │  └────────────────────────────────────────────┘   │
│ │         │                    │                               │
│ │         │  📧 STEP 2: Send Email                  0.3s  ✅  │
│ │         │  ┌─ Input ────────────────────────────────────┐   │
│ │         │  │ To: user@example.com                       │   │
│ │         │  │ Subject: Your summary is ready             │   │
│ │         │  │ Body: "OpenAI has released GPT-5..."       │   │
│ │         │  └────────────────────────────────────────────┘   │
│ │         │  ┌─ Output ───────────────────────────────────┐   │
│ │         │  │ { "status": "sent", "id": "msg_abc123" }  │   │
│ │         │  └────────────────────────────────────────────┘   │
│ └─────────┘                                                    │
└─────────────────────────────────────────────────────────────────┘
```

### "Add Step" Dropdown

```
┌──────────────────────────────┐
│  Add a step                  │
│                              │
│  🤖  OpenAI Chat             │
│      AI text generation      │
│                              │
│  🌐  HTTP Request            │
│      Call any API            │
│                              │
│  🔄  Transform               │
│      Reshape data            │
│                              │
│  🔀  Condition               │
│      If/else logic           │
│                              │
│  📧  Email                   │
│      Send an email           │
└──────────────────────────────┘
```

### Live Execution View (overlay on editor when running)

```
  STEP 1
  ┌──────────────────────────────────────────────┐
  │  🤖 OpenAI Chat                     ✅ 1.2s  │
  │  ▸ Show input/output                         │
  └──────────────────────────────────────────────┘
                   │
  STEP 2
  ┌──────────────────────────────────────────────┐
  │  📧 Send Email                      ⏳ ...   │
  │  Running...                                  │
  └──────────────────────────────────────────────┘
```

Steps animate from ⏳ → ✅ or ❌ in real time via Supabase Realtime subscription.

---

## Node Specifications

### Node 1: OpenAI Chat

```typescript
// Config schema (stored in steps.config JSONB)
{
  model: "gpt-4o" | "gpt-4o-mini" | "gpt-3.5-turbo",
  systemPrompt: string,          // supports {{variables}}
  userPrompt: string,            // supports {{variables}}
  maxTokens: number,
  temperature: number,           // 0-2, default 1
  credentialId: string           // reference to credentials table
}

// Output schema (stored in step_executions.output JSONB)
{
  content: string,               // the AI response text
  model: string,                 // actual model used
  tokens: {
    input: number,
    output: number,
    total: number
  },
  cost: number,                  // estimated cost in USD
  finishReason: string           // "stop" | "length" | etc
}
```

### Node 2: HTTP Request

```typescript
// Config
{
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  url: string,                   // supports {{variables}}
  headers: Record<string, string>, // supports {{variables}}
  body: string | object,         // supports {{variables}}
  responseType: "json" | "text"
}

// Output
{
  status: number,
  headers: Record<string, string>,
  body: any                      // parsed JSON or raw text
}
```

### Node 3: Transform

```typescript
// Config
{
  expression: string             // JavaScript expression
  // Example: "{ name: input.data[0].name, count: input.data.length }"
  // 'input' refers to the previous step's output
}

// Output
// Whatever the expression evaluates to
```

### Node 4: Condition (If/Else)

```typescript
// Config
{
  expression: string,            // JS expression that evaluates to boolean
  // Example: "input.tokens.total > 100"
  // If true: continue to next step
  // If false: skip next step
  skipCount: number              // how many steps to skip if false (default 1)
}

// Output
{
  result: boolean,
  skipped: number                // how many steps were skipped
}
```

### Node 5: Email (via Resend API)

```typescript
// Config
{
  to: string,                    // supports {{variables}}
  subject: string,               // supports {{variables}}
  body: string,                  // supports {{variables}}, plain text or HTML
  credentialId: string           // Resend API key from credentials
}

// Output
{
  status: "sent",
  messageId: string
}
```

---

## API Routes

### Workflow CRUD

```
GET    /api/workflows              → list user's workflows
POST   /api/workflows              → create workflow { name }
GET    /api/workflows/[id]         → get workflow with steps
PUT    /api/workflows/[id]         → update workflow { name, description, trigger_type }
DELETE /api/workflows/[id]         → delete workflow
```

### Steps CRUD

```
GET    /api/workflows/[id]/steps          → list steps (ordered)
POST   /api/workflows/[id]/steps          → add step { type, position, config }
PUT    /api/workflows/[id]/steps/[stepId] → update step { config, position, name }
DELETE /api/workflows/[id]/steps/[stepId] → delete step (reorder remaining)
PUT    /api/workflows/[id]/steps/reorder  → reorder steps { stepIds[] }
```

### Execution

```
POST   /api/execute                       → run workflow { workflowId, triggerData? }
GET    /api/workflows/[id]/executions     → list executions for workflow
GET    /api/executions/[id]               → get execution with step_executions
```

### Webhook Trigger

```
POST   /api/webhook/[workflowId]          → trigger workflow execution (public endpoint)
```

### Credentials

```
GET    /api/credentials                   → list user's credentials (names only, not secrets)
POST   /api/credentials                   → create { name, type, data }
DELETE /api/credentials/[id]              → delete credential
```

---

## Execution Engine (Core Logic)

```typescript
// engine/executor.ts — pseudocode

async function executeWorkflow(workflowId: string, triggerData: any) {
  // 1. Load workflow and steps
  const workflow = await db.workflows.findById(workflowId)
  const steps = await db.steps.findByWorkflow(workflowId, { orderBy: 'position' })

  // 2. Create execution record
  const execution = await db.executions.create({
    workflowId,
    status: 'running',
    triggerData,
    startedAt: new Date()
  })

  // 3. Build context (accumulates outputs as steps run)
  const context = {
    trigger: triggerData
  }

  let skipCount = 0

  // 4. Run each step sequentially
  for (const step of steps) {
    // Handle skipping (from condition node)
    if (skipCount > 0) {
      await saveStepExecution(execution.id, step, 'skipped', {}, {})
      skipCount--
      continue
    }

    // Create step execution record (status: running)
    const stepExec = await db.stepExecutions.create({
      executionId: execution.id,
      stepId: step.id,
      position: step.position,
      status: 'running',
      startedAt: new Date()
    })

    try {
      // Resolve variables in step config
      const resolvedConfig = resolveVariables(step.config, context)

      // Get the node handler
      const handler = getNodeHandler(step.type)

      // Execute the node
      const startTime = Date.now()
      const output = await handler.execute(resolvedConfig, context)
      const duration = Date.now() - startTime

      // Save result
      await db.stepExecutions.update(stepExec.id, {
        status: 'completed',
        input: resolvedConfig,
        output: output,
        finishedAt: new Date(),
        durationMs: duration
      })

      // Add output to context for next steps
      context[`step${step.position + 1}`] = { output }

      // Handle condition node (sets skipCount)
      if (step.type === 'condition' && !output.result) {
        skipCount = step.config.skipCount || 1
      }

    } catch (error) {
      // Save error and stop workflow
      await db.stepExecutions.update(stepExec.id, {
        status: 'failed',
        error: error.message,
        finishedAt: new Date()
      })

      await db.executions.update(execution.id, {
        status: 'failed',
        error: `Failed at step ${step.position + 1}: ${error.message}`,
        finishedAt: new Date(),
        durationMs: Date.now() - execution.startedAt
      })

      return // Stop execution
    }
  }

  // 5. Mark execution complete
  await db.executions.update(execution.id, {
    status: 'completed',
    finishedAt: new Date(),
    durationMs: Date.now() - execution.startedAt
  })
}
```

---

## Build Phases (3 Weeks)

### Week 1: Foundation + Workflow Editor

| Day | Task | Files |
|-----|------|-------|
| 1 | Scaffold: `bunx create-next-app`, install shadcn/ui + Tailwind. Set up Supabase project. Run migration. | `package.json`, `tailwind.config.ts`, `.env.local`, `supabase/migrations/` |
| 2 | Auth: Login/signup page with Supabase Auth UI. Auth middleware for protected routes. | `src/app/login/page.tsx`, `src/lib/supabase/`, `src/components/layout/auth-guard.tsx` |
| 3 | Layout: Sidebar + topbar. Workflow list page (grid of cards). Create/delete workflow. | `src/app/layout.tsx`, `src/components/layout/sidebar.tsx`, `src/app/workflows/page.tsx` |
| 4 | Workflow editor: Render steps as cards in vertical list. Add step button with dropdown. Delete step. Drag to reorder. | `src/app/workflows/[id]/page.tsx`, `src/components/workflow/workflow-editor.tsx`, `step-card.tsx`, `add-step-button.tsx` |
| 5 | Step config forms: Inline config for each of the 5 node types. Variable input component with `{{}}` highlighting. | `src/components/workflow/step-config/*.tsx`, `variable-input.tsx` |

### Week 2: Execution Engine + Nodes

| Day | Task | Files |
|-----|------|-------|
| 6 | Execution engine core: Sequential runner, context builder, variable resolver. | `src/engine/executor.ts`, `resolver.ts`, `types.ts` |
| 7 | OpenAI node: Chat completion via API. Extract tokens, cost, response. | `src/engine/nodes/openai.ts` |
| 8 | HTTP Request node + Transform node. | `src/engine/nodes/http-request.ts`, `transform.ts` |
| 9 | Condition node + Email node (via Resend). | `src/engine/nodes/condition.ts`, `email.ts` |
| 10 | API route: `/api/execute`. Wire "Run" button to execute workflow. Webhook trigger route. | `src/app/api/execute/route.ts`, `src/app/api/webhook/[workflowId]/route.ts` |

### Week 3: Execution Visibility + Polish

| Day | Task | Files |
|-----|------|-------|
| 11 | Execution list: Show recent runs per workflow with status, duration, timestamp. | `src/components/execution/execution-list.tsx`, `src/app/workflows/[id]/executions/page.tsx` |
| 12 | Execution detail: Full input/output view at every step. JSON viewer component. | `src/app/workflows/[id]/executions/[execId]/page.tsx`, `execution-detail.tsx`, `step-result-card.tsx` |
| 13 | Live execution: Subscribe to Supabase Realtime. Steps animate ⏳→✅/❌ as they complete. | `src/components/execution/live-indicator.tsx`, realtime subscription in editor |
| 14 | Credential management: Add/delete API keys. Encrypted storage. Credential picker in node configs. | `src/app/credentials/page.tsx`, `src/lib/crypto.ts` |
| 15 | Polish: Error states, loading states, empty states. 3 workflow templates. Mobile responsiveness. | All components, `src/lib/templates.ts` |

---

## Templates (Pre-built Workflows)

### Template 1: AI Content Summarizer
```
Trigger: Webhook
Step 1: OpenAI Chat — "Summarize this text: {{trigger.body.text}}"
Step 2: HTTP Request — POST to Slack webhook with summary
```

### Template 2: AI Data Extractor
```
Trigger: Manual
Step 1: HTTP Request — GET data from external API
Step 2: OpenAI Chat — "Extract the following fields: name, email, company from: {{step1.output.body}}"
Step 3: HTTP Request — POST extracted data to your database API
```

### Template 3: Webhook-to-Email
```
Trigger: Webhook
Step 1: Transform — reshape webhook data
Step 2: Email — send formatted email with {{step1.output}}
```

---

## Success Criteria for MVP

After 3 weeks, you should be able to:

1. ✅ Sign up / log in
2. ✅ Create a workflow with 2-5 steps
3. ✅ Configure each step inline (Notion-like editing)
4. ✅ Click "Run" and see steps execute in real time
5. ✅ Click any execution and see full input/output at every step
6. ✅ Trigger a workflow via webhook
7. ✅ Store and use API credentials securely
8. ✅ Start from a template

**THE differentiator is #5** — seeing exactly what happened at every step. This is what n8n does poorly and what you do well.

---

## Post-MVP (What Comes Next)

- Cron/scheduled triggers
- Parallel execution
- More nodes (Slack, Google Sheets, Notion, database)
- Workflow versioning
- Team collaboration
- Usage analytics (ClickHouse comes back here)
- Billing (Stripe, per-execution pricing)
- Public API
- Workflow marketplace / sharing
