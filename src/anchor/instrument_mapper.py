import importlib

MODULE_MAP = {
    "openai": "openai",
}

INSTRUMENT_MAP = {
    "openai": "instrumentation.openai.openaiInstrumentor",
}

def get_instrumentor(name):
    """
    Get the instrumentor collections for the given module.
    """
    if name not in INSTRUMENT_MAP:
        raise ValueError(f"Instrumentor {name} not found.")
    
    path, instrName = INSTRUMENT_MAP[name].rsplit('.', 1)

    try:
        module = importlib.import_module(path)
        # returns instance of the instrumentor class
        return getattr(module, instrName)
    except ImportError:
        raise ImportError(f"Instrumentor {name} not found.")

