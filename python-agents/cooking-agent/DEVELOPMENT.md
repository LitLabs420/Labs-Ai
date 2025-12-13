# Cooking Agent Development Guide

This document helps you extend and maintain the cooking AI agent.

## Local workflow

1. Create or update `.env` from `.env.example` (include your GitHub Models API key).
2. Run `python setup.py` to install dependencies and create a venv.
3. Use `python quickstart.py` to interact with the agent via the console.
4. Run `pytest test_cooking_agent.py` after changing logic.

## Extending the toolbox

- Add new recipes inside `cooking_tools.RecipeDatabase._build_recipes`.
- Improve ingredient parsing by adjusting the regex in `IngredientExtractor`.
- Introduce more tools by extending `CookingToolbox` and calling them from `main.CookingAIAgent.act`.

## Model integration

- The `AgentConfig` class loads `GITHUB_MODELS_API_KEY` and `GITHUB_MODELS_ENDPOINT`.
- `CookingAIAgent.call_model` sends prompts to the configured endpoint and returns the first choice.
- You can wrap this call for logging, caching, or streaming in the future.

## Testing tips

- Use dependency injection in tests by replacing `CookingToolbox` with mocks if you need to stub the HTTP client.
- Increase coverage for edge cases (empty queries, invalid responses, network failures).
