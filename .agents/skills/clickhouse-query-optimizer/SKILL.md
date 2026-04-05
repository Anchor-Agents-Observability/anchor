---
name: clickhouse-query-optimizer
description: Optimize ClickHouse queries to improve dashboard performance and reduce latency.
---

**Trigger:** Slow dashboard queries  
**Inputs:** SQL queries, page load patterns  
**Steps:**
1. Limit selected columns
2. Push tenant/date filters early
3. Add pagination/limits
4. Ensure sorting/index-friendly patterns
**Output:** faster query profiles  
**Done when:** dashboard latency improves measurably.