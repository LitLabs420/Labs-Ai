#!/usr/bin/env python3
import os

# Fix the import in app/api/tasks/submit/route.ts
file = 'app/api/tasks/submit/route.ts'
with open(file, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace named import with default import and get instance
old_import = "import { Consumer } from '@/lib/nats-consumer';"
new_import = "import NATSConsumer from '@/lib/nats-consumer';\nconst Consumer = NATSConsumer.getInstance();"

content = content.replace(old_import, new_import)

with open(file, 'w', encoding='utf-8') as f:
    f.write(content)

print('✓ Fixed Consumer import in app/api/tasks/submit/route.ts')
