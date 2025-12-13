"""Cooking utilities used by the Cooking AI Agent."""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import Iterable, List, Tuple


@dataclass
class Recipe:
    title: str
    ingredients: List[str]
    steps: List[str]
    prep_time: str
    tags: List[str] = field(default_factory=list)
    cuisine: str = ""


class RecipeDatabase:
    """In-memory recipe collection for demonstration purposes."""

    def __init__(self) -> None:
        self._recipes = self._build_recipes()

    def search(self, query: str) -> List[Recipe]:
        normalized = query.lower()
        hits = [recipe for recipe in self._recipes if normalized in recipe.title.lower()]
        if hits:
            return hits
        return [recipe for recipe in self._recipes if any(normalized in tag for tag in recipe.tags)]

    def list_titles(self) -> List[str]:
        return [recipe.title for recipe in self._recipes]

    def _build_recipes(self) -> List[Recipe]:
        return [
            Recipe(
                title="Creamy Garlic Pasta",
                ingredients=[
                    "8 oz linguine",
                    "2 tbsp butter",
                    "4 cloves garlic, sliced",
                    "1 cup heavy cream",
                    "1/2 cup Parmesan",
                    "Fresh parsley",
                ],
                steps=[
                    "Cook pasta until al dente.",
                    "Sauté garlic in butter until fragrant.",
                    "Add cream and reduce slightly.",
                    "Toss pasta with sauce and finish with Parmesan.",
                ],
                prep_time="20 minutes",
                tags=["pasta", "italian", "quick"],
                cuisine="Italian",
            ),
            Recipe(
                title="Citrus Stir-Fry Bowl",
                ingredients=[
                    "1 tbsp sesame oil",
                    "2 cups mixed vegetables",
                    "1 lb diced tofu",
                    "2 tbsp tamari",
                    "1 tbsp orange juice",
                    "1 tsp chili flakes",
                ],
                steps=[
                    "Heat oil and sear tofu chunks until golden.",
                    "Add vegetables and stir-fry until crisp-tender.",
                    "Finish with tamari, orange juice, and chili flakes.",
                    "Serve over rice or noodles.",
                ],
                prep_time="25 minutes",
                tags=["stir-fry", "vegan", "weeknight"],
                cuisine="Asian",
            ),
            Recipe(
                title="Sunflower Oat Breakfast Cookies",
                ingredients=[
                    "1 cup rolled oats",
                    "1/2 cup sunflower seeds",
                    "2 ripe bananas",
                    "1/4 cup almond butter",
                    "1 tsp cinnamon",
                    "Pinch of sea salt",
                ],
                steps=[
                    "Mash bananas and mix with almond butter.",
                    "Fold in oats, seeds, cinnamon, and salt.",
                    "Scoop onto lined baking sheet and bake at 350°F for 12 minutes.",
                ],
                prep_time="30 minutes",
                tags=["baking", "snack", "healthy"],
                cuisine="Health",
            ),
        ]


class IngredientExtractor:
    """Heuristic ingredient parser that turns sentences into ingredient lists."""

    INGREDIENT_PATTERN = re.compile(r"(?P<ingredient>[\w\s]+?)(?:,\s*|\s+-\s*|$)")

    def extract(self, text: str) -> List[str]:
        normalized = text.strip().lower()
        candidates = self.INGREDIENT_PATTERN.findall(normalized)
        cleaned: List[str] = []
        for candidate in candidates:
            candidate = candidate.strip()
            if not candidate or candidate in {"and", "or"}:
                continue
            cleaned.append(candidate)
        return cleaned


class CookingToolbox:
    """Aggregates cooking helpers for the agent."""

    help_text = (
        "Commands:\n"
        "  recipe <keyword>  — search for a recipe by name or attribute\n"
        "  ingredients <text> — extract ingredients from a note\n"
        "  tips <topic> — get culinary tips\n"
        "  model <prompt> — forward prompt to GitHub models (requires API key)\n"
        "  help / exit"
    )

    def __init__(self) -> None:
        self.database = RecipeDatabase()
        self.extractor = IngredientExtractor()

    def search_recipes(self, query: str) -> List[str]:
        recipes = self.database.search(query)
        if not recipes:
            return ["No recipes matched your query."]
        return [f"{recipe.title} ({recipe.prep_time})\nIngredients: {', '.join(recipe.ingredients)}" for recipe in recipes]

    def extract_ingredients(self, text: str) -> List[str]:
        ingredients = self.extractor.extract(text)
        if not ingredients:
            return ["I couldn't find any ingredients in that text. Try listing them separated by commas."]
        return ["Detected ingredients:", *ingredients]

    def cooking_tips(self, topic: str) -> List[str]:
        topic = topic.lower()
        if "pasta" in topic:
            return [
                "Always salt the pasta water generously — it should taste like seawater.",
                "Reserve some pasta water before draining to finish the sauce.",
            ]
        if "stir" in topic:
            return [
                "Prep all your vegetables and aromatics before turning on the heat.",
                "Use a wok or wide pan to keep ingredients moving quickly and evenly.",
            ]
        if "bake" in topic or "cookies" in topic:
            return [
                "Chill cookie dough for better texture and flavor concentration.",
                "Rotate the baking sheet halfway through for even color.",
            ]
        return [
            "Trust your senses — smell, sight, and taste in quick succession when adjusting seasoning.",
            "Layer flavors: acid, salt, fat, and heat harmonize a dish.",
        ]

    def handle_request(self, message: str) -> List[str]:
        return ["I don't recognize that command. Try 'help' for the list of valid instructions."]
