---
name: otel-trace-debugger
description: Debug and ensure end-to-end OpenTelemetry trace visibility.
---

**Trigger:** Missing/incomplete telemetry  
**Inputs:** SDK config, gateway path, collector config  
**Steps:**
1. Verify span creation point
2. Verify export endpoint/headers
3. Verify gateway forwarding/injection
4. Verify collector → ClickHouse path
**Output:** breakpoint diagnosis and fix list  
**Done when:** trace appears end-to-end with tenant metadata.