# MVP Landing Page Prompt for Anchor SDK

## Landing Page Prompt

Create an MVP landing page for **Anchor SDK** - Zero-Code Multi-Agent Observability.

### Product Overview
Anchor SDK is an observability platform that automatically instruments LLM applications (OpenAI, Claude, etc.) with zero code changes. It captures traces, metrics, and logs and stores them in ClickHouse for analysis in Grafana.

### Key Features to Highlight
1. **Zero-Code Instrumentation** - No code changes required, automatic monitoring
2. **Multi-Agent Support** - Works with OpenAI, Claude, and more (OpenAI currently implemented)
3. **Complete Observability** - Traces, metrics, logs all in one place
4. **OpenTelemetry Native** - Built on industry-standard OpenTelemetry
5. **Open Source Stack** - ClickHouse + Grafana for storage and visualization
6. **LLM-Specific Insights** - Token usage, latency, model performance, user queries, AI responses

### Page Structure

**Hero Section:**
- Headline: "Zero-Code Observability for LLM Applications"
- Subheadline: "Automatically monitor OpenAI, Claude, and other AI models with no code changes. Get complete visibility into token usage, latency, and AI performance."
- Primary CTA: "Get Started" (links to docs/installation)
- Secondary CTA: "View on GitHub" or "See Demo"
- Visual: Screenshot of Grafana dashboard showing traces or a diagram of the architecture

**Problem/Solution Section:**
- Problem: "Building LLM apps but blind to what's happening? Struggling to debug AI performance, track costs, or understand user interactions?"
- Solution: "Anchor SDK automatically instruments your LLM calls and gives you complete observability without changing a single line of code."

**Features Section (3-4 cards):**
1. **Zero Code Changes**
   - Description: "Just initialize the SDK once. All your OpenAI, Claude, and other AI calls are automatically instrumented."
   - Icon: Magic wand / automation

2. **Complete Visibility**
   - Description: "See every API call, token usage, latency, user queries, and AI responses in beautiful Grafana dashboards."
   - Icon: Eye / dashboard

3. **Production Ready**
   - Description: "Built on OpenTelemetry, stored in ClickHouse, visualized in Grafana. Enterprise-grade observability stack."
   - Icon: Shield / infrastructure

4. **Cost Tracking**
   - Description: "Track token usage and costs per model, per request, or per user. Never be surprised by AI bills again."
   - Icon: Dollar / analytics

**How It Works Section:**
1. Install Anchor SDK: `pip install anchor-sdk`
2. Initialize once: `anchor.init(otlp_endpoint="...")`
3. Make AI calls normally: Your existing OpenAI/Claude code works unchanged
4. View insights: See all traces in Grafana automatically

**Technical Details Section:**
- Built on OpenTelemetry standards
- Supports OpenAI (Claude coming soon)
- Exports to OTLP collector → ClickHouse → Grafana
- Docker setup included for easy deployment

**CTA Section:**
- "Start Monitoring Your LLM Apps in 5 Minutes"
- Button: "Get Started" or "Install Now"
- Link to quick start guide

**Footer:**
- GitHub link
- Documentation link
- "Open Source" badge

### Design Guidelines
- Clean, modern, developer-focused design
- Use code snippets to show simplicity
- Include architecture diagram
- Show real Grafana dashboard screenshots
- Dark mode option if possible
- Mobile responsive

### Tone
- Developer-friendly
- Technical but accessible
- Focus on benefits (time saved, visibility gained)
- Emphasize "zero code changes" and ease of use

### Key Metrics to Highlight (if available)
- "Monitor X+ API calls"
- "Track token usage with 100% accuracy"
- "Set up in under 5 minutes"

---

## Alternative: Minimal MVP Version

If you want to go even simpler for MVP:

**Single Page with:**
1. Hero: Headline + Value Prop + CTA
2. 3 Features (one sentence each)
3. Code example showing how easy it is
4. Screenshot of dashboard
5. "Get Started" CTA

**Suggested Minimal Copy:**

**Headline:** "Observability for LLM Apps. Zero Code Required."

**Subheadline:** "Anchor SDK automatically instruments OpenAI, Claude, and other AI models. See every API call, token usage, and response in Grafana dashboards."

**Code Example:**
```python
# That's it. Your AI calls are now monitored.
import anchor
anchor.init(otlp_endpoint="http://localhost:4318")

# Your existing code works unchanged
from openai import OpenAI
client = OpenAI()
response = client.chat.completions.create(...)
```

**3 Features:**
- ✅ Zero code changes - Works with your existing code
- ✅ Complete visibility - Traces, metrics, logs in Grafana
- ✅ Production ready - OpenTelemetry + ClickHouse

**CTA:** "Get Started" → Quick Start Guide
