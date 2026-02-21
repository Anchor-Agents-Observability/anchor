# Anchor Workflows

**AI workflow automation where you can see everything.**

Anchor is an n8n competitor for AI workflows that feels like Notion — clean, linear, document-style workflow editor with best-in-class execution visibility. Every workflow step shows exactly what went in, what came out, and why it failed.

## 🎯 Vision

Build the most transparent AI workflow automation platform for developers. Not no-code for marketing teams, but low-code for developers building AI-powered automations (content pipelines, data extraction, chatbot flows, AI agents).

## ✨ Features

- **📝 Notion-like Editor**: Clean, document-style workflow builder
- **🔍 Complete Visibility**: See exact input/output for every step
- **⚡ Real-time Execution**: Live updates as workflows run
- **🤖 AI-First Nodes**: OpenAI, HTTP requests, data transforms, conditions, email
- **🔗 Webhook Triggers**: HTTP endpoints for external integrations
- **🔐 Secure**: Row-level security with Supabase
- **📊 Execution History**: Full audit trail of every workflow run

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Bun (recommended) or npm/yarn
- Supabase account

### Installation

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd anchor
   bun install  # or npm install
   ```

2. **Set up Supabase:**
   - Create a new Supabase project
   - Run the migration from `supabase/migrations/001_initial_schema.sql`
   - Copy your project URL and anon key

3. **Configure environment:**
   ```bash
   cp .env.example .env.local
   ```

   Fill in your environment variables:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

4. **Start development server:**
   ```bash
   bun dev  # or npm run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)**

## 📋 Development Commands

```bash
# Development
bun dev          # Start dev server
bun build        # Build for production
bun start        # Start production server
bun lint         # Run ESLint
bun typecheck    # Run TypeScript checks
```

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 14 (App Router) + TypeScript
- **UI**: shadcn/ui + Tailwind CSS (Notion-like design)
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **Runtime**: Bun (fast installs, native TypeScript)
- **Deployment**: Vercel + Supabase

### Key Components

```
src/
├── app/                    # Next.js App Router pages
│   ├── workflows/         # Main workflow editor and management
│   ├── login/            # Authentication
│   └── api/              # API routes (execute, webhook)
├── components/
│   ├── workflow/         # Workflow editor components
│   ├── execution/        # Execution history and detail views
│   ├── layout/          # App layout (sidebar, auth)
│   └── ui/              # shadcn/ui components
├── engine/               # Workflow execution engine
│   ├── nodes/           # Node implementations (OpenAI, HTTP, etc.)
│   ├── executor.ts      # Core execution logic
│   └── resolver.ts      # Variable resolution ({{step1.output}})
└── lib/                 # Utilities and Supabase clients
```

## 🔧 Workflow Nodes

### 🤖 OpenAI Chat
- AI text generation with GPT models
- Supports system prompts, temperature, max tokens
- Automatic cost calculation and token counting

### 🌐 HTTP Request
- Call any REST API (GET, POST, PUT, DELETE)
- Custom headers and request bodies
- JSON and text response parsing

### 🔄 Transform
- Reshape data with JavaScript expressions
- Access previous step outputs
- JSON manipulation and data mapping

### 🔀 Condition
- If/else logic with JavaScript expressions
- Skip subsequent steps based on conditions
- Boolean evaluation with context access

### 📧 Email
- Send emails via Resend API
- HTML and plain text support
- Template support with variable substitution

## 🔍 Execution Visibility

**The key differentiator**: Complete transparency into workflow execution.

- **Live Updates**: Watch steps execute in real-time
- **Input/Output Inspection**: See exactly what data flows between steps
- **Error Details**: Clear error messages with context
- **Performance Metrics**: Duration and cost tracking
- **Full History**: Audit trail of all executions

## 🔒 Security

- **Row Level Security**: Users only see their own workflows
- **Encrypted Credentials**: API keys stored securely
- **Authentication**: Supabase Auth with Google/GitHub OAuth
- **Safe Execution**: Sandboxed JavaScript execution for transforms

## 🛣️ Roadmap

### MVP (Current)
- ✅ Workflow editor with 5 node types
- ✅ Real-time execution visibility
- ✅ Webhook triggers
- ✅ User authentication
- ✅ Execution history

### Next Phase
- [ ] Cron/scheduled triggers
- [ ] More node types (Slack, Google Sheets, Notion)
- [ ] Workflow templates
- [ ] Team collaboration
- [ ] Usage analytics
- [ ] Public API

## 🤝 Contributing

This is currently a private MVP. Once we open source:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

[License TBD]

---

**Built with ❤️ for developers who want to see what's happening in their AI workflows.**