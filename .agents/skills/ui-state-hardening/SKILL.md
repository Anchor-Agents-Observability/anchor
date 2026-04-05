---
name: ui-state-hardening
description: Add robust loading, error, and empty states to ensure stable user experiences.
---

**Trigger:** Any async page/action  
**Inputs:** page list and data dependencies  
**Steps:**
1. Add loading state
2. Add empty state with next action
3. Add error state with retry guidance
4. Confirm success toasts/messages
**Output:** stable UX state matrix  
**Done when:** no blank/silent failure states remain.