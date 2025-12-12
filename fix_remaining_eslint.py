#!/usr/bin/env python3
"""Fix remaining ESLint unused variable warnings."""
import os
import re

os.chdir(r'C:\LitLabs420\Labs-Ai')

# Test that we're in the right directory
if not os.path.exists('package.json'):
    print("ERROR: Not in correct directory")
    exit(1)

files_to_fix = {
    # app/dashboard/web3/page.tsx - Remove unused interface definitions
    'app/dashboard/web3/page.tsx': [
        (r"interface TokenBalance \{\n  symbol: string;\n  name: string;\n  balance: number;\n  usdValue: number;\n  change24h: number;\n  icon: string;\n\}\n\n", ""),
        (r"interface WalletAccount \{\n  address: string;\n  network: 'ethereum' \| 'polygon' \| 'arbitrum';\n  balance: number;\n  nftCount: number;\n\}\n\n", ""),
    ],
    # components/Hero.tsx - Remove unused background parameter
    'components/Hero.tsx': [
        (r"  background = 'gradient',\n", ""),
    ],
    # components/VoiceInput.tsx - Remove unused placeholder parameter
    'components/VoiceInput.tsx': [
        (r"  placeholder = 'Click mic to speak\.\.\.',\n", ""),
    ],
    # components/ui/Button.tsx - Remove unused currentTheme
    'components/ui/Button.tsx': [
        (r"  const \{ currentTheme \} = useTheme\(\);\n\n", ""),
    ],
}

for file_path, patterns in files_to_fix.items():
    if os.path.exists(file_path):
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original = content
            for pattern, replacement in patterns:
                content = re.sub(pattern, replacement, content, flags=re.MULTILINE | re.DOTALL)
            
            if content != original:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f'✓ Fixed: {file_path}')
            else:
                print(f'⚠ No changes: {file_path}')
        except Exception as e:
            print(f'✗ Error in {file_path}: {e}')
    else:
        print(f'✗ File not found: {file_path}')

print("\nDone!")
