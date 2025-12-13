"""Quickstart runner for the cooking agent."""

from __future__ import annotations

import asyncio
import pathlib
import sys

from dotenv import load_dotenv

from main import AgentConfig, CookingAIAgent

load_dotenv()


async def main() -> None:
    config = AgentConfig.from_env()
    agent = CookingAIAgent(config)
    await agent.run_interactive()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        sys.exit(0)
