---
name: tenant-safety-auditor
description: Audit and enforce tenant safety in data access and server actions.
---

**Trigger:** Data access changes or security review  
**Inputs:** query files, server actions, handlers  
**Steps:**
1. Trace tenant context source
2. Ensure tenant filter in every query
3. Verify URL params never authorize access
4. Fail closed on missing tenant
**Output:** tenant-safety findings + fixes  
**Done when:** cross-tenant leakage paths are closed.