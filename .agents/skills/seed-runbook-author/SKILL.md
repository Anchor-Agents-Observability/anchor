---
name: seed-runbook-author
description: Create deterministic seed data and runbooks for demos and tests.
---

**Trigger:** Need deterministic demo/test environment  
**Inputs:** services, seed scripts, required fixtures  
**Steps:**
1. Create minimal seed dataset
2. Add reset command path
3. Document exact run order
4. Include verification checks
**Output:** `DEMO_RUNBOOK.md` or setup section  
**Done when:** any teammate can prepare demo in one pass.