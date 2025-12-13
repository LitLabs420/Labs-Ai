# Project Overview

- **Name:** Cooking AI Agent
- **Languages:** Python 3.10+
- **Dependencies:** agent-framework-azure-ai, python-dotenv, aiohttp, pydantic, pytest
- **Primary goal:** Provide an interactive cooking assistant that can search recipes, parse ingredients, deliver culinary tips, and forward prompts to GitHub models.
- **Structure:** Agent config → Toolbox (recipes + extractor) → Console loop → Optional GitHub model invocation.
- **Deployment:** Run `python setup.py` to create a virtual environment, then `python quickstart.py` or `bash quickstart.sh` to launch.
