"""Tests for the cooking agent utilities."""

from cooking_tools import CookingToolbox, IngredientExtractor, RecipeDatabase


def test_recipe_search_finds_recipes():
    toolbox = CookingToolbox()
    results = toolbox.search_recipes("pasta")
    assert any("Creamy Garlic Pasta" in item for item in results)


def test_recipe_search_fall_back_on_tag():
    toolbox = CookingToolbox()
    assert toolbox.search_recipes("vegan")


def test_ingredient_extractor_handles_commas():
    extractor = IngredientExtractor()
    parsed = extractor.extract("tomatoes, basil, garlic")
    assert parsed == ["tomatoes", "basil", "garlic"]


def test_ingredient_extractor_filters_common_words():
    extractor = IngredientExtractor()
    parsed = extractor.extract("salt, and, pepper")
    assert parsed == ["salt", "pepper"]


def test_cooking_tips_default():
    toolbox = CookingToolbox()
    tips = toolbox.cooking_tips("general")
    assert "Layer flavors" in tips[-1]


def test_cooking_tips_pasta():
    toolbox = CookingToolbox()
    pasta_tips = toolbox.cooking_tips("pasta tips")
    assert any("salt the pasta water" in tip for tip in pasta_tips)


def test_database_list_titles_includes_all():
    database = RecipeDatabase()
    titles = database.list_titles()
    assert len(titles) >= 3


def test_handle_request_returns_help_hint():
    toolbox = CookingToolbox()
    fallback = toolbox.handle_request("unknown command")
    assert "help" in fallback[0].lower()
