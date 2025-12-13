# Cooking AI Agent

A lightweight Python-based agent that pairs a tool-driven cooking assistant with GitHub models (gpt-4o-mini). Use this agent from the console to search recipes, parse ingredient notes, and request culinary tips.

## Features

- **Recipe search:** Query a tiny in-memory recipe catalog (pasta, stir-fry, cookies).
- **Ingredient extraction:** Pull ingredients from a natural-language sentence.
- **Cooking tips:** Get quick multi-topic culinary advice (pasta, stir fry, baking, general).
- **GitHub Models integration:** Forward prompts to the gpt-4o-mini endpoint if you supply an API key.

## Getting started

1. Copy `.env.example` to `.env` and add your GitHub Models API key.
2. Run `python setup.py` to provision a `venv` and install dependencies.
3. Start the agent with `python quickstart.py`.

### Example session

```text
Cooking Agent Console. Type 'help' for commands. Type 'exit' to leave.
› recipe pasta
Creamy Garlic Pasta (20 minutes)
Ingredients: 8 oz linguine, 2 tbsp butter, 4 cloves garlic, 1 cup heavy cream, 1/2 cup Parmesan, Fresh parsley
› ingredients 2 chicken breasts, lemon zest, rosemary
Detected ingredients:
2 chicken breasts
lemon zest
rosemary
› tips pasta
Always salt the pasta water generously — it should taste like seawater.
Reserve some pasta water before draining to finish the sauce.
› model Tell me a comforting winter pasta pairing.
Model says: (model output)
› exit
``` 

## Project layout

- `main.py` – interactive agent loop + GitHub model client
- `cooking_tools.py` – recipe catalog, ingredient extractor, toolbox helpers
- `test_cooking_agent.py` – pytest suite for utilities
- `requirements.txt` – pinned dependencies
- `setup.py` / `quickstart` – environment bootstrapper
- `README.md`, `DEVELOPMENT.md`, `IMPLEMENTATION_SUMMARY.md`, `PROJECT_OVERVIEW.md` – documentation

## Testing

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pip install pytest
pytest test_cooking_agent.py
```

## Questions

Reach out to the LitLabs AI team or open an issue if you need help hooking the agent to other data sources.
