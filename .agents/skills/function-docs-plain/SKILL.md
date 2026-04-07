---
name: function-docs-plain
description: Write concise, accurate docstrings and documentation for functions and methods without fluff, boilerplate, or guessed behavior.
---

**Trigger:** Brief docs or docstrings for functions or methods  
**Inputs:** implementation + nearby call sites if needed  
**Steps:**
1. Read the implementation first
2. State what it does in one plain sentence
3. Mention only important inputs, outputs, and side effects
4. Use code names and types as written; skip obvious details
5. If behavior is unclear, say so instead of guessing
**Output:** short, accurate function docs or docstrings  
**Done when:** a developer can use the function without reading the whole body.
