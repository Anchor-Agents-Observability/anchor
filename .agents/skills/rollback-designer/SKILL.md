---
name: rollback-designer
description: Design rollback plans for safe reversion of high-risk changes.
---

**Trigger:** Medium/high risk changes  
**Inputs:** deployment path + changed modules  
**Steps:**
1. Define rollback point
2. Document feature flags/toggles if any
3. Identify data migration reversibility
4. Add runbook notes
**Output:** rollback plan snippet  
**Done when:** operator can revert safely in minutes.
