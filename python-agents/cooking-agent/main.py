"""
Main Cooking AI Agent Application
Uses Microsoft Agent Framework with GitHub Models
"""

import os
import sys
import json
from typing import Any
from dotenv import load_dotenv

# Import agent framework
try:
    from azure.ai.agent import Agent, AgentContext, ClientError
    from azure.ai.projects import AIProjectClient
    from azure.identity import DefaultAzureCredential
except ImportError:
    print("Error: Agent Framework not installed.")
    print("Install with: pip install agent-framework-azure-ai --pre")
    sys.exit(1)

from cooking_tools import CookingToolbox


class CookingAIAgent:
    """Interactive Cooking AI Agent"""
    
    def __init__(self):
        """Initialize the cooking AI agent"""
        load_dotenv()
        
        self.toolbox = CookingToolbox()
        self.conversation_history = []
        self.debug = os.getenv("DEBUG", "false").lower() == "true"
        
        # Initialize agent with GitHub Models
        self.agent = self._init_agent()
        self.setup_tools()
    
    def _init_agent(self) -> Agent:
        """Initialize the agent with GitHub Models"""
        github_token = os.getenv("GITHUB_TOKEN")
        
        if not github_token or github_token == "your_github_token_here":
            print("⚠️  GitHub token not configured!")
            print("Please set your GITHUB_TOKEN in .env file")
            print("Get a token from: https://github.com/settings/tokens?type=beta")
            sys.exit(1)
        
        # Create agent with GitHub Models endpoint
        # Using gpt-4o-mini model available on GitHub Models free tier
        agent = Agent(
            name="Cooking Assistant",
            model="gpt-4o-mini",  # GitHub Models free tier
            instructions=self._get_system_prompt(),
            # GitHub Models endpoint configuration
            api_key=github_token,
            api_base="https://models.inference.ai.azure.com",
        )
        
        return agent
    
    def _get_system_prompt(self) -> str:
        """Get the system prompt for the cooking agent"""
        return """You are an expert cooking AI assistant with deep knowledge of recipes, cooking techniques, and culinary arts.

Your responsibilities:
1. Help users search for recipes and find cooking inspiration
2. Extract and organize ingredients from recipe text
3. Provide detailed cooking instructions and tips
4. Answer questions about cooking techniques, ingredient substitutions, and food pairing
5. Offer dietary advice and modifications for recipes

When users ask for recipes:
- Search the recipe database for matching recipes
- Provide full details including ingredients, instructions, and timing
- Suggest variations and modifications based on dietary needs

When users provide recipes or ingredient lists:
- Extract ingredients and organize them in a structured format
- Identify missing information and ask clarifying questions
- Provide cooking tips relevant to the dish

Always be helpful, encouraging, and share your culinary knowledge generously.
Use emojis to make responses more engaging and organized.

Available tools:
- Search recipes by name or ingredients
- Get detailed recipe information
- Extract ingredients from text
- List all available recipes
- Provide cooking tips for different techniques"""
    
    def setup_tools(self):
        """Setup tools for the agent"""
        # Define tool schemas for the agent
        self.tools = [
            {
                "name": "search_recipes",
                "description": "Search for recipes by name or ingredients",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "query": {
                            "type": "string",
                            "description": "Search query (recipe name or ingredient)"
                        }
                    },
                    "required": ["query"]
                }
            },
            {
                "name": "get_recipe_details",
                "description": "Get full details of a specific recipe including ingredients and instructions",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "recipe_name": {
                            "type": "string",
                            "description": "Name of the recipe to retrieve"
                        }
                    },
                    "required": ["recipe_name"]
                }
            },
            {
                "name": "extract_ingredients",
                "description": "Extract and organize ingredients from provided recipe text",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "text": {
                            "type": "string",
                            "description": "Recipe text containing ingredients"
                        }
                    },
                    "required": ["text"]
                }
            },
            {
                "name": "list_recipes",
                "description": "List all available recipes in the database",
                "parameters": {
                    "type": "object",
                    "properties": {}
                }
            },
            {
                "name": "cooking_tips",
                "description": "Get cooking tips for specific techniques or topics",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "topic": {
                            "type": "string",
                            "description": "Cooking topic (e.g., pasta, stir-fry, baking, general)"
                        }
                    },
                    "required": ["topic"]
                }
            }
        ]
    
    def process_tool_call(self, tool_name: str, tool_input: dict) -> str:
        """Process tool calls from the agent"""
        try:
            if tool_name == "search_recipes":
                return self.toolbox.search_recipes(tool_input.get("query", ""))
            elif tool_name == "get_recipe_details":
                return self.toolbox.get_recipe_details(tool_input.get("recipe_name", ""))
            elif tool_name == "extract_ingredients":
                return self.toolbox.extract_ingredients_from_text(tool_input.get("text", ""))
            elif tool_name == "list_recipes":
                return self.toolbox.list_available_recipes()
            elif tool_name == "cooking_tips":
                return self.toolbox.get_cooking_tips(tool_input.get("topic", "general"))
            else:
                return f"Unknown tool: {tool_name}"
        except Exception as e:
            return f"Error executing tool: {str(e)}"
    
    def chat(self, user_message: str) -> str:
        """Send a message to the agent and get a response"""
        # Add user message to history
        self.conversation_history.append({
            "role": "user",
            "content": user_message
        })
        
        # Get response from agent
        # Note: Actual implementation depends on Agent Framework API
        # This is a simplified version showing the concept
        try:
            # Create messages for the agent
            messages = self.conversation_history.copy()
            
            # Simple implementation: pass to agent and get response
            # In production, this would use proper agent execution
            response = self._get_agent_response(messages)
            
            # Add assistant response to history
            self.conversation_history.append({
                "role": "assistant",
                "content": response
            })
            
            return response
        except Exception as e:
            error_msg = f"Error getting response: {str(e)}"
            if self.debug:
                print(f"Debug: {error_msg}")
            return error_msg
    
    def _get_agent_response(self, messages: list) -> str:
        """Get response from the agent"""
        # This is a simplified implementation
        # In production, use proper Agent Framework execution
        
        # For now, use a rule-based approach with tool calling
        user_message = messages[-1]["content"].lower()
        
        # Determine which tool to use based on user input
        if any(word in user_message for word in ["search", "find", "look for", "recipe"]):
            # Extract search query
            query = messages[-1]["content"]
            if "search" in user_message or "find" in user_message:
                # Remove command words
                query = query.replace("search", "").replace("find", "").replace("for", "").strip()
            return self.process_tool_call("search_recipes", {"query": query})
        
        elif any(word in user_message for word in ["extract", "parse", "ingredients from"]):
            text = messages[-1]["content"]
            return self.process_tool_call("extract_ingredients", {"text": text})
        
        elif any(word in user_message for word in ["list", "show", "available recipes"]):
            return self.process_tool_call("list_recipes", {})
        
        elif any(word in user_message for word in ["tip", "advice", "technique"]):
            # Extract topic
            topic = "general"
            for t in ["pasta", "stir-fry", "baking"]:
                if t in user_message:
                    topic = t
                    break
            return self.process_tool_call("cooking_tips", {"topic": topic})
        
        elif any(word in user_message for word in ["carbonara", "stir fry", "cookies"]):
            # Get recipe details
            recipe_name = ""
            if "carbonara" in user_message:
                recipe_name = "Pasta Carbonara"
            elif "stir fry" in user_message:
                recipe_name = "Vegetable Stir Fry"
            elif "cookies" in user_message:
                recipe_name = "Chocolate Chip Cookies"
            return self.process_tool_call("get_recipe_details", {"recipe_name": recipe_name})
        
        # Default response
        return self._generate_default_response(messages[-1]["content"])
    
    def _generate_default_response(self, user_input: str) -> str:
        """Generate a helpful default response"""
        responses = {
            "hello": "👋 Hello! I'm your cooking assistant. I can help you search for recipes, extract ingredients, and provide cooking tips. What would you like to cook today?",
            "help": "I can help you with:\n• 🔍 Search recipes\n• 📖 Get recipe details\n• 🥘 Extract ingredients\n• 📋 List available recipes\n• 💡 Get cooking tips\n\nWhat can I help you with?",
            "thanks": "You're welcome! Happy cooking! 🍳",
        }
        
        for key, response in responses.items():
            if key in user_input.lower():
                return response
        
        return "I'm a cooking assistant. I can help you search for recipes, extract ingredients, and provide cooking tips. Try asking me to search for a recipe or get cooking tips!"
    
    def run_interactive(self):
        """Run the agent in interactive mode"""
        print("\n" + "="*60)
        print("🍳 Welcome to the Cooking AI Agent!")
        print("="*60)
        print("\nI'm your personal cooking assistant. I can help you:")
        print("  • 🔍 Search for recipes")
        print("  • 📖 Get detailed recipe instructions")
        print("  • 🥘 Extract and organize ingredients")
        print("  • 💡 Get cooking tips and techniques")
        print("\nType 'help' for more options or 'quit' to exit.\n")
        
        while True:
            try:
                user_input = input("You: ").strip()
                
                if not user_input:
                    continue
                
                if user_input.lower() in ["quit", "exit", "bye"]:
                    print("\nAssistant: Thanks for cooking with me! Goodbye! 👋")
                    break
                
                if user_input.lower() == "help":
                    print("\nAssistant: Here's what I can do:\n")
                    print("  🔍 Search recipes: 'search for pasta recipes'")
                    print("  📖 Get details: 'show me the carbonara recipe'")
                    print("  🥘 Extract ingredients: 'extract ingredients from [recipe text]'")
                    print("  📋 List all: 'what recipes do you have?'")
                    print("  💡 Tips: 'give me pasta cooking tips'")
                    print()
                    continue
                
                # Get response from agent
                response = self.chat(user_input)
                print(f"\nAssistant: {response}\n")
                
            except KeyboardInterrupt:
                print("\n\nAssistant: Thanks for cooking with me! Goodbye! 👋")
                break
            except Exception as e:
                print(f"Error: {str(e)}")
                if self.debug:
                    import traceback
                    traceback.print_exc()


def main():
    """Main entry point"""
    agent = CookingAIAgent()
    agent.run_interactive()


if __name__ == "__main__":
    main()
