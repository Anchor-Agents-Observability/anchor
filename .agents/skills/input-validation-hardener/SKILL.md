---
name: input-validation-hardener
description: Harden input validation to ensure robust and secure handling of user inputs.
---

**Trigger:** Form/server action/API changes  
**Inputs:** payload shapes and constraints  
**Steps:**
1. Define validation rules
2. Validate at server boundary
3. Return user-safe error messages
4. Log internal diagnostics safely
**Output:** robust validation layer  
**Done when:** invalid inputs cannot corrupt behavior.