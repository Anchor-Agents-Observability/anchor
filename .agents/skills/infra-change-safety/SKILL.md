---
name: infra-change-safety
description: Ensure safe and reversible infrastructure changes with minimal blast radius.
---

**Trigger:** Terraform/config updates  
**Inputs:** target environment and modules  
**Steps:**
1. Minimize blast radius
2. Validate variable defaults and secrets handling
3. Check dependencies/order
4. Document rollback implications
**Output:** safe infra patch notes  
**Done when:** change is reviewable and reversible.