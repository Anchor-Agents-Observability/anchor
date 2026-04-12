"""
LLM pricing data for cost tracking.
Prices are per 1M tokens as (input_cost, output_cost).
"""

OPENAI_PRICING = {
    "gpt-4o": (2.50, 10.00),
    "gpt-4o-2024-11-20": (2.50, 10.00),
    "gpt-4o-2024-08-06": (2.50, 10.00),
    "gpt-4o-mini": (0.15, 0.60),
    "gpt-4o-mini-2024-07-18": (0.15, 0.60),
    "gpt-4-turbo": (10.00, 30.00),
    "gpt-4-turbo-2024-04-09": (10.00, 30.00),
    "gpt-4": (30.00, 60.00),
    "gpt-4-0613": (30.00, 60.00),
    "gpt-3.5-turbo": (0.50, 1.50),
    "gpt-3.5-turbo-0125": (0.50, 1.50),
    "o1": (15.00, 60.00),
    "o1-2024-12-17": (15.00, 60.00),
    "o1-mini": (3.00, 12.00),
    "o1-mini-2024-09-12": (3.00, 12.00),
    "o3-mini": (1.10, 4.40),
    "text-embedding-ada-002": (0.10, 0.0),
    "text-embedding-3-small": (0.02, 0.0),
    "text-embedding-3-large": (0.13, 0.0),
}

ANTHROPIC_PRICING = {
    "claude-sonnet-4-20250514": (3.00, 15.00),
    "claude-3-5-sonnet-20241022": (3.00, 15.00),
    "claude-3-5-sonnet-20240620": (3.00, 15.00),
    "claude-3-opus-20240229": (15.00, 75.00),
    "claude-3-sonnet-20240229": (3.00, 15.00),
    "claude-3-haiku-20240307": (0.25, 1.25),
    "claude-3-5-haiku-20241022": (1.00, 5.00),
}

_ALL_PRICING = {
    "openai": OPENAI_PRICING,
    "anthropic": ANTHROPIC_PRICING,
}


def calculate_cost(model, input_tokens, output_tokens, provider="openai"):
    """
    Calculate the cost of an LLM API call.

    Returns the cost in USD, or None if the model isn't in the pricing table.
    """
    pricing = _ALL_PRICING.get(provider, {})
    if model not in pricing:
        return None
    input_rate, output_rate = pricing[model]
    cost = (input_tokens * input_rate + output_tokens * output_rate) / 1_000_000
    return round(cost, 6)
