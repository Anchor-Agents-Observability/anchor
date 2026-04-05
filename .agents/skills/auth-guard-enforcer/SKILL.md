---
name: auth-guard-enforcer
description: Enforce authentication and authorization checks for routes and actions, ensuring unauthorized access is blocked consistently.
---

**Trigger:** Route or action auth modifications  
**Inputs:** middleware/routes/server actions  
**Steps:**
1. Mark public vs protected routes explicitly
2. Enforce auth check at boundary
3. Verify redirect behavior
4. Verify authenticated happy path
**Output:** auth matrix and route guard updates  
**Done when:** unauthorized access blocked consistently.