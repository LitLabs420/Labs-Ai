#!/usr/bin/env python3
"""
Fix all ESLint unused variable warnings by properly removing/renaming them.
"""
import os
import re

fixes = [
    {
        'file': 'app/api/monetization/dashboard/route.ts',
        'replacements': [
            (r'\.filter\(\[\_, enabled\]\)', r'.filter(([, enabled]) => enabled)')
        ]
    },
    {
        'file': 'app/dashboard/web3/page.tsx',
        'replacements': [
            (r"import\s+{[^}]*TokenBalance[^}]*}\s+from[^;]+;", '// TokenBalance type removed - unused\n'),
            (r"import\s+{[^}]*WalletAccount[^}]*}\s+from[^;]+;", '// WalletAccount type removed - unused\n'),
        ]
    },
    {
        'file': 'app/design-showcase/page.tsx',
        'replacements': [
            (r'const\s+\[\s*loading\s*,\s*setLoading\s*\]\s*=\s*useState\(false\)\s*;', '')
        ]
    },
    {
        'file': 'components/Hero.tsx',
        'replacements': [
            (r'const\s+background\s*=\s*[^;]+;', '// const background removed - unused')
        ]
    },
    {
        'file': 'components/VoiceInput.tsx',
        'replacements': [
            (r'const\s+placeholder\s*=\s*[^;]+;', '// const placeholder removed - unused')
        ]
    },
    {
        'file': 'components/ui/Button.tsx',
        'replacements': [
            (r'const\s+currentTheme\s*=\s*[^;]+;', '// const currentTheme removed - unused')
        ]
    },
    {
        'file': 'lib/advanced-analytics.ts',
        'replacements': [
            (r'const\s*{\s*setDoc\s*,\s*', 'const { /* setDoc */,'),
            (r'const\s*{\s*updateDoc\s*,\s*', 'const { /* updateDoc */,'),
            (r'const\s*{\s*increment\s*,\s*', 'const { /* increment */,'),
        ]
    },
    {
        'file': 'lib/auth-gcip.ts',
        'replacements': [
            (r'import\s+type\s+{\s*PhoneAuthCredential\s*}\s+from[^;]+;', '// PhoneAuthCredential import removed - unused\n')
        ]
    },
    {
        'file': 'lib/gcip.ts',
        'replacements': [
            (r'import\s+type\s+{\s*PhoneAuthCredential\s*}\s+from[^;]+;', '// PhoneAuthCredential import removed - unused\n'),
            (r'(const\s+error\s*=\s*)([^;]+;)', r'// \1 removed - unused')
        ]
    },
    {
        'file': 'lib/nats-consumer.backup.ts',
        'replacements': [
            (r'const\s*{\s*getConfig\s*,\s*', 'const { /* getConfig */,'),
            (r'const\s*{\s*captureError\s*,\s*captureMessage\s*,\s*', 'const { /* captureError, captureMessage */,'),
        ]
    },
    {
        'file': 'lib/server-initializer.ts',
        'replacements': [
            (r'import\s*{\s*initializeFirebase\s*,\s*', 'import { /* initializeFirebase */,'),
            (r'const\s+services\s*=\s*[^;]+;', '// const services removed - unused'),
            (r'\[\s*_\s*,\s*\]', '/* unused */'),
        ]
    },
    {
        'file': 'lib/stripe-billing.ts',
        'replacements': [
            (r'const\s*{\s*FieldValue\s*,\s*', 'const { /* FieldValue */,'),
        ]
    },
    {
        'file': 'lib/stripe-enhanced.ts',
        'replacements': [
            (r'const\s+customer\s*=\s*await[^;]+;', '// const customer removed - unused')
        ]
    },
    {
        'file': 'lib/subscription-manager.ts',
        'replacements': [
            (r'const\s*{\s*getAdminDb\s*,\s*', 'const { /* getAdminDb */,'),
            (r'const\s+teamRef\s*=\s*[^;]+;', '// const teamRef removed - unused')
        ]
    },
    {
        'file': 'lib/task-manager.ts',
        'replacements': [
            (r'const\s*{\s*description\s*,\s*', 'const { /* description */,'),
            (r'const\s*{\s*tone\s*,\s*', 'const { /* tone */,'),
            (r'const\s*{\s*context\s*,\s*', 'const { /* context */,'),
            (r'const\s*{\s*style\s*,\s*', 'const { /* style */,'),
        ]
    },
    {
        'file': 'lib/test-workflows.ts',
        'replacements': [
            (r'const\s+testAffiliateId\s*=\s*[^;]+;', '// const testAffiliateId removed - unused'),
        ]
    },
    {
        'file': 'scripts/verify-system.ts',
        'replacements': [
            (r'const\s+__filename\s*=\s*[^;]+;', '// const __filename removed - unused'),
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
                content = re.sub(pattern, replacement, content, flags=re.DOTALL)
            
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
