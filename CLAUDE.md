# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Anchor Workflows is an AI workflow automation platform - an n8n competitor that feels like Notion. It provides a clean, document-style workflow editor with complete execution visibility. The platform focuses on transparency, showing exactly what goes into each step, what comes out, and why things fail.

**One-liner**: "AI workflow automation where you can see everything."

**Target user**: Developers building AI-powered automations (content pipelines, data extraction, chatbot flows, AI agents).

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript
- **UI Library**: shadcn/ui + Tailwind CSS (Notion-like design)
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **Runtime**: Bun (preferred) or Node.js 18+
- **Deployment**: Vercel + Supabase
- **Authentication**: Supabase Auth with OAuth (Google/GitHub)
- **Real-time**: Supabase Realtime for live execution updates

## Architecture

### High-Level Structure
1. **Workflow Editor** (`/workflows/[id]`): Main interface for building workflows
2. **Execution Engine** (`/src/engine/`): Server-side workflow execution
3. **Node System**: Pluggable node types (OpenAI, HTTP, Transform, Condition, Email)
4. **Real-time Updates**: Live execution visibility via Supabase Realtime

### Key Directories
- `src/app/`: Next.js App Router pages and API routes
- `src/components/`: React components organized by feature
- `src/engine/`: Workflow execution logic and node implementations
- `src/lib/`: Utilities, Supabase clients, and shared logic
- `supabase/migrations/`: Database schema and setup

## Development Commands

```bash
# Development
bun dev          # Start development server
bun build        # Build for production
bun start        # Start production server
bun lint         # Run ESLint
bun typecheck    # Run TypeScript type checking

# Package management (prefer Bun)
bun install      # Install dependencies
bun add <package>    # Add dependency
bun add -d <package> # Add dev dependency
```

## Database Schema

The application uses Supabase with the following core tables:

- **workflows**: User's workflow definitions
- **steps**: Individual workflow steps with configuration
- **executions**: Workflow run instances
- **step_executions**: Individual step results with input/output
- **credentials**: Encrypted API keys and secrets

All tables use Row Level Security (RLS) - users can only access their own data.

## Workflow Execution Flow

1. User clicks "Run" or webhook triggers workflow
2. `executeWorkflow()` loads workflow and steps from database
3. For each step:
   - Resolve variables like `{{trigger.data}}` or `{{step1.output}}`
   - Execute appropriate node handler
   - Save input/output to `step_executions` table
   - Real-time updates broadcast via Supabase
4. Mark execution as completed/failed

## Node Types

Each node type implements the `NodeHandler` interface:

- **openai**: OpenAI Chat Completions with cost tracking
- **http**: REST API calls (GET, POST, PUT, DELETE)
- **transform**: JavaScript expression evaluation for data transformation
- **condition**: If/else logic that can skip subsequent steps
- **email**: Send emails via Resend API

## Key Features

- **Variable Resolution**: `{{trigger.body.text}}`, `{{step1.output.result}}`
- **Real-time Execution**: Live updates as workflows run
- **Complete Visibility**: Full input/output inspection for debugging
- **Webhook Triggers**: Public endpoints at `/api/webhook/[workflowId]`
- **Secure by Default**: RLS, encrypted credentials, sandboxed execution

## Development Patterns

- Use server components where possible for better performance
- Client components marked with `'use client'` directive
- Real-time subscriptions in `useEffect` with proper cleanup
- Error boundaries and loading states for better UX
- Type-safe with TypeScript throughout

## Environment Variables

Required environment variables (see `.env.example`):

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

## Important Files

- `src/engine/executor.ts`: Core workflow execution logic
- `src/engine/resolver.ts`: Variable resolution system
- `src/app/api/execute/route.ts`: Manual workflow execution API
- `src/app/api/webhook/[workflowId]/route.ts`: Webhook trigger API
- `src/app/workflows/[id]/page.tsx`: Main workflow editor UI
- `supabase/migrations/001_initial_schema.sql`: Complete database setup

## Common Tasks

- **Add new node type**: Create handler in `src/engine/nodes/`, register in `index.ts`
- **Add UI component**: Use shadcn/ui patterns, follow Notion-like design
- **Database changes**: Create new migration, update TypeScript types
- **Debug execution**: Check `step_executions` table or execution detail UI

The codebase prioritizes developer experience, type safety, and execution transparency above all else.