"""Cooking agent harness that wires together the cookbook tools and GitHub-powered models."""

from __future__ import annotations

import asyncio
import json
import os
import sys
from dataclasses import dataclass
from typing import Any, Dict, Optional

import aiohttp
from dotenv import load_dotenv

from cooking_tools import CookingToolbox


DEFAULT_MODEL_ENDPOINT = "https://models.inference.ai.azure.com/v1/models/gpt-4o-mini/completions"


@dataclass
class AgentConfig:
    github_api_key: str
    model_endpoint: str
    locale: str = "en-US"

    @classmethod
    def from_env(cls) -> "AgentConfig":
        load_dotenv()
        return cls(
            github_api_key=os.environ.get("GITHUB_MODELS_API_KEY", ""),
            model_endpoint=os.environ.get("GITHUB_MODELS_ENDPOINT", DEFAULT_MODEL_ENDPOINT),
            locale=os.environ.get("COOKING_AGENT_LOCALE", "en-US"),
        )


class CookingAIAgent:
    """Simple interactive cooking agent that delegates to tools and optionally calls GitHub models."""

    def __init__(self, config: AgentConfig) -> None:
        self.config = config
        self.toolbox = CookingToolbox()
        self._client: Optional[aiohttp.ClientSession] = None

    @property
    def headers(self) -> Dict[str, str]:
        return {
            "Authorization": f"Bearer {self.config.github_api_key}",
            "Content-Type": "application/json",
        }

    async def call_model(self, prompt: str) -> str:
        if not self.config.github_api_key:
            return "A GitHub Models API key is required to generate completions."

        payload = {
            "model": "gpt-4o-mini",
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.6,
        }

        session = self._client or aiohttp.ClientSession()
        self._client = session

        async with session.post(self.config.model_endpoint, headers=self.headers, json=payload) as response:
            data = await response.json()
            if response.status >= 300:
                detail = data.get("error", response.reason)
                return f"Model call failed: {detail}"
            choices = data.get("choices") or []
            if not choices:
                return "No response from GitHub Models."
            return choices[0].get("message", {}).get("content", "(empty response)")

    async def run_interactive(self) -> None:
        print("Cooking Agent Console. Type 'help' for commands. Type 'exit' to leave.")
        while True:
            try:
                query = input("› ").strip()
            except (EOFError, KeyboardInterrupt):
                print("\nExiting.")
                break

            if not query:
                continue
            command = query.lower()
            if command in {"exit", "quit"}:
                print("Good luck in the kitchen!")
                break
            if command == "help":
                print(self.toolbox.help_text)
                continue

            response = await self.act(query)
            print("\n".join(response))

    async def act(self, user_message: str) -> list[str]:
        results = [self.toolbox.help_text]
        if user_message.lower().startswith("recipe"):
            results = self.toolbox.search_recipes(user_message)
        elif user_message.lower().startswith("ingredients"):
            results = self.toolbox.extract_ingredients(user_message)
        elif user_message.lower().startswith("tips"):
            results = self.toolbox.cooking_tips(user_message)
        elif "model" in user_message.lower():
            model_response = await self.call_model(user_message)
            results = [f"Model says: {model_response}"]
        else:
            results = self.toolbox.handle_request(user_message)
        return results

    async def shutdown(self) -> None:
        if self._client:
            await self._client.close()


async def main() -> None:
    config = AgentConfig.from_env()
    agent = CookingAIAgent(config)
    try:
        await agent.run_interactive()
    finally:
        await agent.shutdown()


if __name__ == "__main__":
    asyncio.run(main())
