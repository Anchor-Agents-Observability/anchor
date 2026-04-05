---
name: gateway-reliability-tuner
description: Tune gateway reliability by improving error handling, timeouts, and rate-limiting.
---

**Trigger:** Gateway errors/timeouts/rate issues  
**Inputs:** handlers, middleware, Redis interactions  
**Steps:**
1. Check timeout usage and error handling
2. Verify auth and ratelimit correctness
3. Improve logs and status codes
4. Keep per-request path efficient
**Output:** reliability patch set  
**Done when:** predictable behavior under normal failure modes.