# Implementation Summary

The cooking AI agent is a lightweight Python tool that demonstrates how to pair domain-specific tooling with GitHub models. 

## Highlights

- **Interactive console** (`main.py`) that listens for commands, routes them through the toolbox, and optionally sends prompts to the gpt-4o-mini endpoint.
- **Tooling layer** (`cooking_tools.py`) with a curated recipe catalog, ingredient extraction, and topic-specific tips.
- **Testing harness** (`test_cooking_agent.py`) that verifies search results, parser accuracy, and fallback messaging.
- **Environment helpers** (`setup.py`, `quickstart.py`, `quickstart.sh`) that bootstrap the venv and run the agent.
- **Documentation** includes usage guides, development instructions, and project overviews.

## Architecture

1. Agent configuration is read from `.env` (API key, endpoint, locale).
2. Requests go through `CookingToolbox`, which interacts with `RecipeDatabase` and `IngredientExtractor`.
3. When the user asks for a `model` prompt, the agent composes an HTTP request to GitHub models via `aiohttp`.
4. Responses are printed to the console, providing a human-friendly interface for testing and prototyping.
