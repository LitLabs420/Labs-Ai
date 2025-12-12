#!/usr/bin/env python3
import os
import re

# Dictionary of files and their fixes
fixes = {
    'app/design-showcase/page.tsx': [
        (r'const \[loading, setLoading\] = useState\(false\);', '')
    ],
    'components/Hero.tsx': [
        (r'const background = ', '// const background = ')
    ],
    'components/VoiceInput.tsx': [
        (r'const placeholder = ', '// const placeholder = ')
    ],
    'components/ui/Button.tsx': [
        (r'const currentTheme = ', '// const currentTheme = ')
    ],
    'components/ui/Card.tsx': [
        (r'import { useTheme }', '// import { useTheme }')
    ],
    'lib/advanced-analytics.ts': [
        (r'const { setDoc } = ', '// setDoc removed - unused'),
        (r'const { updateDoc } = ', '// updateDoc removed - unused'),
        (r'const { increment } = ', '// increment removed - unused'),
    ],
    'lib/auth-gcip.ts': [
        (r'import.*PhoneAuthCredential.*from', '// PhoneAuthCredential import removed - unused\nimport'),
        (r'const phoneAuthProvider = ', '// const phoneAuthProvider = '),
    ],
    'lib/config.ts': [
        (r'const config = getConfig\(\);', '// const config = getConfig(); // unused'),
    ],
    'lib/gcip.ts': [
        (r'import.*PhoneAuthCredential.*from', '// PhoneAuthCredential import removed - unused\nimport'),
        (r'const error = ', '// const error = '),
    ],
    'lib/nats-consumer.backup.ts': [
        (r'const { getConfig } = ', '// getConfig import removed'),
        (r'const { captureError, captureMessage } = ', '// capture imports removed'),
        (r'type NatsConnection = ', '// type NatsConnection - unused'),
        (r'type Subscription = ', '// type Subscription - unused'),
    ],
    'lib/server-initializer.ts': [
        (r'import.*type.*Config.*from', '// Config type removed - unused\nimport'),
        (r'import.*initializeFirebase.*from', '// initializeFirebase removed - unused\nimport'),
        (r'import.*captureError.*from', '// captureError removed - unused\nimport'),
        (r'const services = ', '// const services = '),
        (r'const \[_, \] = ', '// unused destructure removed'),
    ],
    'lib/stripe-billing.ts': [
        (r'type.*FieldValue.*from', '// FieldValue type removed - unused'),
    ],
    'lib/stripe-enhanced.ts': [
        (r'const customer = await stripe\.customers\.retrieve', '// const customer = await stripe.customers.retrieve'),
    ],
    'lib/subscription-manager.ts': [
        (r'const { getAdminDb } = ', '// getAdminDb removed - unused'),
        (r'const teamRef = ', '// const teamRef = '),
    ],
    'lib/task-manager.ts': [
        (r'import.*captureError.*from', '// captureError import removed - unused\nimport'),
        (r'const { description } = ', '// description destructured - unused'),
        (r'const { tone } = ', '// tone destructured - unused'),
        (r'const { context } = ', '// context destructured - unused'),
        (r'const { style } = ', '// style destructured - unused'),
        (r'const { automationType, trigger, action } = ', '// automation properties - unused'),
    ],
    'lib/test-workflows.ts': [
        (r'import.*signInWithEmailAndPassword.*from', '// signInWithEmailAndPassword import removed - unused\nimport'),
        (r'import.*getDocs.*from', '// getDocs import removed - unused\nimport'),
        (r'import.*query.*from', '// query import removed - unused\nimport'),
        (r'import.*where.*from', '// where import removed - unused\nimport'),
        (r'const TEST_AFFILIATE_EMAIL = ', '// const TEST_AFFILIATE_EMAIL = '),
        (r'const testAffiliateId = ', '// const testAffiliateId = '),
        (r'const error = ', '// const error = '),
        (r'const usersCollection = ', '// const usersCollection = '),
    ],
    'scripts/verify-system.ts': [
        (r'const __dirname = ', '// const __dirname = '),
        (r'const error = ', '// const error = '),
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
