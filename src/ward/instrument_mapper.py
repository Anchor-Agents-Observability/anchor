"""
Registry that maps provider names (e.g. "openai") to their instrumentor classes.

To add a new provider, add entries to both maps and create the corresponding
module under ward/instrumentation/<provider>/.
"""

import importlib

# provider name → pip package name (for error messages)
MODULE_MAP = {
    "openai": "openai",
    "anthropic": "anthropic",
}

# provider name → fully qualified instrumentor class path
INSTRUMENT_MAP = {
    "openai": "ward.instrumentation.openai.openaiInstrumentor",
    "anthropic": "ward.instrumentation.anthropic.anthropicInstrumentor",
}


def get_instrumentor(name):
    """Get the instrumentor class for the given module name."""
    if name not in INSTRUMENT_MAP:
        raise ValueError(f"Instrumentor '{name}' not found. Available: {list(INSTRUMENT_MAP.keys())}")

    path, instr_name = INSTRUMENT_MAP[name].rsplit(".", 1)

    try:
        module = importlib.import_module(path)
        return getattr(module, instr_name)
    except ImportError:
        raise ImportError(
            f"Could not import instrumentor for '{name}'. "
            f"Make sure the provider package is installed: pip install ward-sdk[{name}]"
        )
