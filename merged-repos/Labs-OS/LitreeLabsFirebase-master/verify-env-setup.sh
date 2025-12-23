#!/bin/bash
# Environment Setup Validation Script
# Run this to verify all required configurations are in place

echo "🔍 Labs OS - Environment Setup Validation"
echo "==========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

errors=0
warnings=0

# Check Node.js
echo -n "📦 Node.js version: "
if command -v node &> /dev/null; then
    echo -e "${GREEN}$(node --version)${NC}"
else
    echo -e "${RED}NOT INSTALLED${NC}"
    ((errors++))
fi

# Check npm/pnpm
echo -n "📦 pnpm version: "
if command -v pnpm &> /dev/null; then
    echo -e "${GREEN}$(pnpm --version)${NC}"
else
    echo -e "${YELLOW}NOT INSTALLED (using npm)${NC}"
    ((warnings++))
fi

# Check git
echo -n "🔧 Git version: "
if command -v git &> /dev/null; then
    echo -e "${GREEN}$(git --version)${NC}"
else
    echo -e "${RED}NOT INSTALLED${NC}"
    ((errors++))
fi

# Check TypeScript
echo -n "📘 TypeScript: "
if [ -d "node_modules/typescript" ]; then
    echo -e "${GREEN}Installed${NC}"
else
    echo -e "${YELLOW}Not in node_modules${NC}"
fi

# Check ESLint
echo -n "✅ ESLint: "
if [ -d "node_modules/eslint" ]; then
    echo -e "${GREEN}Installed${NC}"
else
    echo -e "${YELLOW}Not installed${NC}"
fi

# Check Next.js
echo -n "⚛️  Next.js: "
if [ -d "node_modules/next" ]; then
    echo -e "${GREEN}Installed${NC}"
else
    echo -e "${RED}NOT INSTALLED${NC}"
    ((errors++))
fi

# Check .env.local
echo ""
echo "🔐 Configuration Files:"
echo -n "  .env.local: "
if [ -f ".env.local" ]; then
    echo -e "${GREEN}✓${NC}"
    # Check for required keys
    required_keys=("FIREBASE_PROJECT_ID" "STRIPE_SECRET_KEY" "OPENAI_API_KEY")
    for key in "${required_keys[@]}"; do
        if grep -q "^$key=" .env.local; then
            echo -e "    ${GREEN}✓ $key${NC}"
        else
            echo -e "    ${YELLOW}⚠ $key missing${NC}"
        fi
    done
else
    echo -e "${YELLOW}⚠ Copy from .env.local.example${NC}"
    ((warnings++))
fi

# Check VS Code extensions
echo ""
echo "🎨 VS Code Setup:"
echo -n "  .vscode/settings.json: "
if [ -f ".vscode/settings.json" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
fi

echo -n "  .vscode/launch.json: "
if [ -f ".vscode/launch.json" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
fi

echo -n "  .vscode/tasks.json: "
if [ -f ".vscode/tasks.json" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
fi

echo -n "  .vscode/extensions.json: "
if [ -f ".vscode/extensions.json" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
fi

# Summary
echo ""
echo "==========================================="
if [ $errors -eq 0 ] && [ $warnings -eq 0 ]; then
    echo -e "${GREEN}✅ All systems ready!${NC}"
elif [ $errors -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Setup complete with $warnings warning(s)${NC}"
else
    echo -e "${RED}❌ Setup failed with $errors error(s) and $warnings warning(s)${NC}"
fi

echo ""
echo "📚 Next Steps:"
echo "  1. npm/pnpm install"
echo "  2. Configure .env.local with your API keys"
echo "  3. npm run dev (to start development server)"
echo "  4. Open VS Code Extensions and install recommended extensions"
