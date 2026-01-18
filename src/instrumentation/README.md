Explaining how the instrumentation works:
1) Monkey patching with wrapt
The instrumentation uses the wrapt library to wrap OpenAI methods at runtime. Here's the key line:

the wrapper intercepts calls

dataflow example 
client.chat.completions.create(...)
           ↓
    [WRAPPER INTERCEPTS]
           ↓
    Create OpenTelemetry Span
    Set attributes (model, endpoint)
           ↓
    Call wrapped(*args, kwargs)
           ↓
    [ORIGINAL OpenAI CODE RUNS]
    Makes HTTP request to OpenAI API
    Gets response
           ↓
    [WRAPPER CONTINUES]
    Extract token usage, duration
    Set span attributes
    Record span status
           ↓
    Return response to your code