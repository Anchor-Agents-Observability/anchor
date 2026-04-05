---
name: pr-review-hardener
description: Strengthen pull request reviews by ensuring requirement coverage and regression checks.
---

**Trigger:** Before merge  
**Inputs:** diff + requirements  
**Steps:**
1. Check requirement coverage
2. Check regressions/security/edge cases
3. Verify docs/tests updated
4. Draft concise PR summary
**Output:** merge readiness report  
**Done when:** no unresolved high-risk findings.