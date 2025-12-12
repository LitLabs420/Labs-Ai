#!/usr/bin/env python3
"""
Fix all ESLint unused variable warnings - version 2 with exact patterns.
"""
import os
import re

fixes = [
    {
        'file': 'app/api/monetization/dashboard/route.ts',
        'replacements': [
            # Line 127: '_' is defined but never used
            (
                r'\.filter\(\[_, enabled\]\)',
                '.filter(([, enabled]) => enabled)'
            )
        ]
    },
    {
        'file': 'app/dashboard/web3/page.tsx',
        'replacements': [
            # Lines 7, 16: 'TokenBalance', 'WalletAccount' unused imports
            (
                r"import\s*{\s*([^}]*TokenBalance[^}]*)\s*}\s*from\s*['\"]([^'\"]+)['\"];",
                lambda m: f"import {{ {m.group(1).replace('TokenBalance', '').strip(', ')} }} from '{m.group(2)}';" if 'TokenBalance' in m.group(1) else m.group(0)
            ),
            (
                r"import\s*{\s*([^}]*WalletAccount[^}]*)\s*}\s*from\s*['\"]([^'\"]+)['\"];",
                lambda m: f"import {{ {m.group(1).replace('WalletAccount', '').strip(', ')} }} from '{m.group(2)}';" if 'WalletAccount' in m.group(1) else m.group(0)
            ),
        ]
    },
    {
        'file': 'app/design-showcase/page.tsx',
        'replacements': [
            # Lines 19: 'loading', 'setLoading' unused
            (
                r"const\s*\[\s*loading\s*,\s*setLoading\s*\]\s*=\s*useState\(false\)\s*;",
                ""
            )
        ]
    },
    {
        'file': 'components/Hero.tsx',
        'replacements': [
            # Line 26: 'background' unused
            (
                r"const\s+background\s*=\s*['\"]([^'\"]*)['\"];",
                "// const background removed - unused"
            )
        ]
    },
    {
        'file': 'components/VoiceInput.tsx',
        'replacements': [
            # Line 16: 'placeholder' unused
            (
                r"const\s+placeholder\s*=\s*['\"]([^'\"]*)['\"];",
                "// const placeholder removed - unused"
            )
        ]
    },
    {
        'file': 'components/ui/Button.tsx',
        'replacements': [
            # Line 40: 'currentTheme' unused
            (
                r"const\s+currentTheme\s*=\s*[^;]+;",
                "// const currentTheme removed - unused"
            )
        ]
    },
    {
        'file': 'lib/advanced-analytics.ts',
        'replacements': [
            # Lines 13, 14, 15: setDoc, updateDoc, increment unused imports
            (
                r"import\s*{\s*([^}]*)\s*setDoc\s*,([^}]*)\s*}\s*from\s*['\"]firebase/firestore['\"];",
                r"import { \1\2 } from 'firebase/firestore';"
            ),
            (
                r"import\s*{\s*([^}]*)\s*updateDoc\s*,([^}]*)\s*}\s*from\s*['\"]firebase/firestore['\"];",
                r"import { \1\2 } from 'firebase/firestore';"
            ),
            (
                r"import\s*{\s*([^}]*)\s*increment\s*,([^}]*)\s*}\s*from\s*['\"]firebase/firestore['\"];",
                r"import { \1\2 } from 'firebase/firestore';"
            ),
        ]
    },
    {
        'file': 'lib/auth-gcip.ts',
        'replacements': [
            # Line 22: PhoneAuthCredential unused
            (
                r"import\s*type\s*{\s*([^}]*)\s*PhoneAuthCredential\s*,([^}]*)\s*}\s*from\s*['\"]firebase/auth['\"];",
                r"import type { \1\2 } from 'firebase/auth';"
            ),
        ]
    },
    {
        'file': 'lib/gcip.ts',
        'replacements': [
            # Line 20: PhoneAuthCredential unused
            (
                r"import\s*type\s*{\s*([^}]*)\s*PhoneAuthCredential\s*,([^}]*)\s*}\s*from\s*['\"]firebase/auth['\"];",
                r"import type { \1\2 } from 'firebase/auth';"
            ),
            # Line 124: 'error' unused
            (
                r"const\s+error\s*=\s*[^;]+;",
                "// const error removed - unused"
            ),
        ]
    },
    {
        'file': 'lib/nats-consumer.backup.ts',
        'replacements': [
            # Lines 9, 10: getConfig, captureError, captureMessage unused
            (
                r"import\s*{\s*([^}]*)\s*getConfig\s*,([^}]*)\s*}\s*from\s*['\"]([^'\"]+)['\"];",
                r"import { \1\2 } from '\3';"
            ),
            (
                r"import\s*{\s*([^}]*)\s*captureError\s*,([^}]*)\s*captureMessage\s*,([^}]*)\s*}\s*from\s*['\"]([^'\"]+)['\"];",
                r"import { \1\3 } from '\4';"
            ),
        ]
    },
    {
        'file': 'lib/server-initializer.ts',
        'replacements': [
            # Line 7: initializeFirebase unused
            (
                r"import\s*{\s*([^}]*)\s*initializeFirebase\s*,([^}]*)\s*}\s*from\s*['\"]([^'\"]+)['\"];",
                r"import { \1\2 } from '\3';"
            ),
        ]
    },
    {
        'file': 'lib/stripe-billing.ts',
        'replacements': [
            # Line 6: FieldValue unused
            (
                r"import\s*{\s*([^}]*)\s*FieldValue\s*,([^}]*)\s*}\s*from\s*['\"]([^'\"]+)['\"];",
                r"import { \1\2 } from '\3';"
            ),
        ]
    },
    {
        'file': 'lib/stripe-enhanced.ts',
        'replacements': [
            # Line 59: 'name' unused
            (
                r"const\s*{\s*name\s*,\s*",
                "const { /* name */,"
            ),
        ]
    },
    {
        'file': 'lib/subscription-manager.ts',
        'replacements': [
            # Line 7: getAdminDb unused
            (
                r"import\s*{\s*([^}]*)\s*getAdminDb\s*,([^}]*)\s*}\s*from\s*['\"]([^'\"]+)['\"];",
                r"import { \1\2 } from '\3';"
            ),
        ]
    },
    {
        'file': 'lib/task-manager.ts',
        'replacements': [
            # Line 331: description, tone unused
            (
                r"const\s*{\s*description\s*,\s*",
                "const { /* description */,"
            ),
            (
                r"const\s*{\s*([^}]*)\s*tone\s*,\s*",
                r"const { \1/* tone */,"
            ),
            # Line 344: context unused
            (
                r"const\s*{\s*([^}]*)\s*context\s*,\s*",
                r"const { \1/* context */,"
            ),
            # Line 355, 380: task unused
            (
                r"const\s*{\s*([^}]*)\s*task\s*,([^}]*)\s*}\s*=\s*",
                r"const { \1/* task */\2 } ="
            ),
            # Line 368: style unused
            (
                r"const\s*{\s*([^}]*)\s*style\s*,\s*",
                r"const { \1/* style */,"
            ),
        ]
    },
    {
        'file': 'lib/test-workflows.ts',
        'replacements': [
            # Line 26: testAffiliateId unused
            (
                r"const\s+testAffiliateId\s*=\s*['\"]([^'\"]*)['\"];",
                "// const testAffiliateId removed - unused"
            ),
            # Line 55: error unused
            (
                r"const\s+error\s*=\s*[^;]+;",
                "// const error removed - unused"
            ),
        ]
    },
    {
        'file': 'scripts/verify-system.ts',
        'replacements': [
            # Line 16: path unused
            (
                r"import\s*{\s*([^}]*)\s*path\s*,([^}]*)\s*}\s*from\s*['\"]([^'\"]+)['\"];",
                r"import { \1\2 } from '\3';"
            ),
            # Line 17: fileURLToPath unused
            (
                r"import\s*{\s*([^}]*)\s*fileURLToPath\s*,([^}]*)\s*}\s*from\s*['\"]([^'\"]+)['\"];",
                r"import { \1\2 } from '\3';"
            ),
            # Lines 181, 240: error unused
            (
                r"const\s+error\s*=\s*[^;]+;",
                "// const error removed - unused"
            ),
        ]
    },
]

success_count = 0
fail_count = 0

for fix in fixes:
    filepath = fix['file']
    if os.path.exists(filepath):
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            for pattern, replacement in fix['replacements']:
                if callable(replacement):
                    content = re.sub(pattern, replacement, content, flags=re.MULTILINE | re.DOTALL)
                else:
                    content = re.sub(pattern, replacement, content, flags=re.MULTILINE | re.DOTALL)
            
            if content != original_content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f'✓ Fixed: {filepath}')
                success_count += 1
            else:
                print(f'⚠ No changes: {filepath}')
        except Exception as e:
            print(f'✗ Error in {filepath}: {e}')
            fail_count += 1
    else:
        print(f'✗ File not found: {filepath}')
        fail_count += 1

print(f'\n✓ Successfully fixed {success_count} files')
if fail_count > 0:
    print(f'✗ Failed on {fail_count} files')
