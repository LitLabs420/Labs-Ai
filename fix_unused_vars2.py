#!/usr/bin/env python3
import os
import re

# Careful fixes that only remove the unused parts
fixes = {
    'lib/server-initializer.ts': [
        # Remove Config from import
        (r'import.*Config.*from', 'import'),
        # Remove initializeFirebase from import
        (r', initializeFirebase', ''),
        # Remove captureError from import
        (r', captureError', ''),
    ],
    'lib/stripe-billing.ts': [
        # Remove FieldValue from import
        (r', FieldValue', ''),
    ],
    'lib/auth-gcip.ts': [
        # Comment out PhoneAuthCredential import
        (r'import.*PhoneAuthCredential.*;\n', '// import PhoneAuthCredential removed - unused\n'),
    ],
    'lib/gcip.ts': [
        # Comment out PhoneAuthCredential import  
        (r'import.*PhoneAuthCredential.*;\n', '// import PhoneAuthCredential removed - unused\n'),
    ],
    'lib/advanced-analytics.ts': [
        # Comment out unused destructured imports
        (r'const \{ setDoc,', 'const { /* setDoc */,'),
        (r'const \{ updateDoc,', 'const { /* updateDoc */,'),
        (r'const \{ increment,', 'const { /* increment */,'),
    ],
    'lib/nats-consumer.backup.ts': [
        (r'const \{ getConfig,', 'const { /* getConfig */,'),
        (r'const \{ captureError, captureMessage,', 'const { /* captureError, captureMessage */,'),
    ],
    'lib/subscription-manager.ts': [
        (r'const \{ getAdminDb,', 'const { /* getAdminDb */,'),
    ],
}

for filepath, replacements in fixes.items():
    if os.path.exists(filepath):
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            for pattern, replacement in replacements:
                content = re.sub(pattern, replacement, content)
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            
            print(f'✓ Fixed {filepath}')
        except Exception as e:
            print(f'✗ Error in {filepath}: {e}')
    else:
        print(f'✗ File not found: {filepath}')

print('\nAll files processed!')
