#!/usr/bin/env python3
"""
Comprehensive fix for all remaining ESLint unused variable warnings.
This script makes direct file modifications to fix each warning.
"""
import os
import re

# Change to the project directory
os.chdir(r'C:\LitLabs420\Labs-Ai')

def fix_file(filepath, patterns_and_replacements):
    """Fix a single file with multiple regex replacements."""
    if not os.path.exists(filepath):
        print(f'✗ File not found: {filepath}')
        return False
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        for pattern, replacement in patterns_and_replacements:
            content = re.sub(pattern, replacement, content, flags=re.MULTILINE | re.DOTALL)
        
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f'✓ Fixed: {filepath}')
            return True
        else:
            print(f'⚠ No changes: {filepath}')
            return False
    except Exception as e:
        print(f'✗ Error in {filepath}: {e}')
        return False

# All fixes organized by file
fixes = {
    'app/api/monetization/dashboard/route.ts': [
        (r'\.filter\(\[\_, enabled\]\)', r'.filter(([, enabled]) => enabled)'),
    ],
    'app/dashboard/web3/page.tsx': [
        # Remove TokenBalance interface (if it still exists in disk)
        (r"interface TokenBalance \{[^}]*\}\n\n", ""),
    ],
    'app/design-showcase/page.tsx': [
        # Already fixed via vscode-vfs, but ensure it's complete
    ],
    'components/Hero.tsx': [
        (r"background = 'gradient',\n", ""),
    ],
    'components/VoiceInput.tsx': [
        (r"placeholder = 'Click mic to speak\.\.\.',\n", ""),
    ],
    'components/ui/Button.tsx': [
        (r"const \{ currentTheme \} = useTheme\(\);\n\n", ""),
    ],
    'lib/advanced-analytics.ts': [
        # Remove setDoc, updateDoc, increment from imports
        (r"  setDoc,\n", ""),
        (r"  updateDoc,\n", ""),
        (r"  increment,\n", ""),
    ],
    'lib/auth-gcip.ts': [
        (r",\n  PhoneAuthCredential", ""),
    ],
    'lib/gcip.ts': [
        (r",\n  PhoneAuthCredential", ""),
        (r"\} catch \(error\) \{", r"} catch {"),
    ],
    'lib/server-initializer.ts': [
        # Remove initializeFirebase from imports
        (r"import \{ [^}]*initializeFirebase,\s*", r"import { "),
        (r",\s*initializeFirebase[^}]*\}", r" }"),
    ],
    'lib/stripe-billing.ts': [
        # Already fixed via vscode-vfs
    ],
    'lib/stripe-enhanced.ts': [
        # Remove 'name' from destructuring
        (r"const \{ name,\s*", r"const { /* name */,"),
    ],
    'lib/subscription-manager.ts': [
        # Already fixed via vscode-vfs
    ],
    'lib/task-manager.ts': [
        # Remove unused destructured variables
        (r"const \{ content, description, tone, niche \}", r"const { content, niche }"),
        (r"const \{ message, context \}", r"const { message }"),
        (r"const \{ prompt, style \}", r"const { prompt }"),
        (r"const \{ automationType, trigger, action \}", r"const { automationType, trigger }"),
    ],
    'lib/test-workflows.ts': [
        (r"let testAffiliateId: string;\n", ""),
        (r"\} catch \(error\) \{", r"} catch {"),
    ],
    'scripts/verify-system.ts': [
        (r"import path from 'path';\nimport \{ fileURLToPath \} from 'url';\n", ""),
        (r"const __filename = fileURLToPath\(import\.meta\.url\);\nconst __dirname = path\.dirname\(__filename\);", r"const __dirname = new URL('.', import.meta.url).pathname;"),
        (r"\} catch \(error\) \{", r"} catch {"),
    ],
}

print("Starting ESLint fixes...\n")
fixed_count = 0
for filepath, patterns in fixes.items():
    if patterns:  # Only process files with patterns
        if fix_file(filepath, patterns):
            fixed_count += 1

print(f"\n✓ Total fixed: {fixed_count} files")
