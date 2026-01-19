What is Span? 
A span is a unit of work in a trace. It represents a single operation within a distributed system.

A span represents:
A single operation (e.g., an HTTP request, a database query, a function call)
A time interval with a start and end time
Context about that operation (attributes, events, status)

example: 
Span: "GET /api/users"
├─ Trace ID: abc123...
├─ Span ID: def456...
├─ Parent Span ID: ghi789... (the span that called this)
├─ Start: 2024-01-15 10:00:00.000
├─ End: 2024-01-15 10:00:00.150
├─ Duration: 150ms
├─ Status: OK
├─ Attributes:
│  ├─ http.method: "GET"
│  ├─ http.url: "/api/users"
│  ├─ http.status_code: 200
│  └─ user.id: "12345"
└─ Events:
   └─ [10:00:00.050] "Database query started"
