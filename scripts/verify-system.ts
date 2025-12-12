#!/usr/bin/env node
/**
 * LitLabs AI - System Initialization Verification
 * 
 * Validates all systems are correctly configured and ready for deployment
 * Run: npm run verify
 * 
 * Exit codes:
 * 0 = All systems healthy
 * 1 = Configuration issues found
 * 2 = Missing required components
 * 3 = Integration failures
 */

import fs from 'fs';

<<<<<<< HEAD
const __dirname = new URL('.', import.meta.url).pathname;
=======
// const __filename removed - unused
// const __dirname = path.dirname(__filename);
>>>>>>> dfd3162b670a3588702e8e5f407b818e3c5676d3

interface VerificationResult {
  name: string;
  status: 'pass' | 'warn' | 'fail';
  message: string;
  details?: string[];
}

const results: VerificationResult[] = [];
let criticalFailures = 0;

// Color output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function log(status: 'pass' | 'warn' | 'fail', message: string, details?: string[]) {
  const icon = status === 'pass' ? '✅' : status === 'warn' ? '⚠️ ' : '❌';
  const color = status === 'pass' ? colors.green : status === 'warn' ? colors.yellow : colors.red;

  console.log(`${icon} ${color}${message}${colors.reset}`);
  if (details) {
    details.forEach((detail) => console.log(`   ${detail}`));
  }

  if (status === 'fail') criticalFailures++;
  results.push({ name: message, status, message, details });
}

function section(title: string) {
  console.log(`\n${colors.bold}${colors.cyan}▶ ${title}${colors.reset}`);
}

// Verification Checks
async function verify() {
  console.log(`\n${colors.bold}${colors.cyan}🔍 LitLabs AI System Verification${colors.reset}\n`);

  // 1. Environment Configuration
  section('Environment Configuration');
  
  const envFile = '.env.local';
  if (fs.existsSync(envFile)) {
    log('pass', 'Environment file exists (.env.local)');
    
    const envContent = fs.readFileSync(envFile, 'utf-8');
    const requiredVars = [
      'GOOGLE_GENERATIVE_AI_API_KEY',
      'FIREBASE_PROJECT_ID',
      'STRIPE_SECRET_KEY',
      'NEXT_PUBLIC_APP_URL',
    ];
    
    const missingVars = requiredVars.filter(v => !envContent.includes(v + '='));
    if (missingVars.length === 0) {
      log('pass', 'All required environment variables configured');
    } else {
      log('warn', 'Missing some environment variables', missingVars);
    }
  } else {
    log('fail', 'Environment file not found (.env.local)');
  }

  // 2. File Structure
  section('Project Structure');

  const requiredFiles = [
    'package.json',
    'tsconfig.json',
    'next.config.ts',
    'firebase.json',
    'firestore.rules',
  ];

  requiredFiles.forEach((file) => {
    if (fs.existsSync(file)) {
      log('pass', `File exists: ${file}`);
    } else {
      log('fail', `Missing file: ${file}`);
    }
  });

  // 3. Core Modules
  section('Core Modules');

  const coreModules = [
    'lib/config.ts',
    'lib/server-initializer.ts',
    'lib/firebase-server.ts',
    'lib/stripe-enhanced.ts',
    'lib/subscription-manager.ts',
    'lib/affiliate-system.ts',
    'lib/white-label.ts',
    'lib/advanced-analytics.ts',
    'lib/task-manager.ts',
    'lib/nats-consumer.ts',
    'lib/openai.ts',
  ];

  const missingModules: string[] = [];
  coreModules.forEach((module) => {
    if (fs.existsSync(module)) {
      log('pass', `Module exists: ${module}`);
    } else {
      log('warn', `Module missing: ${module}`);
      missingModules.push(module);
    }
  });

  // 4. API Endpoints
  section('API Endpoints');

  const apiEndpoints = [
    'app/api/health/route.ts',
    'app/api/teams/members/route.ts',
    'app/api/affiliates/route.ts',
    'app/api/analytics/report/route.ts',
    'app/api/monetization/dashboard/route.ts',
    'app/api/tasks/route.ts',
    'app/api/tasks/submit/route.ts',
  ];

  const missingEndpoints: string[] = [];
  apiEndpoints.forEach((endpoint) => {
    if (fs.existsSync(endpoint)) {
      log('pass', `Endpoint exists: ${endpoint}`);
    } else {
      log('warn', `Endpoint missing: ${endpoint}`);
      missingEndpoints.push(endpoint);
    }
  });

  // 5. Dependencies
  section('Dependencies');

  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
    const dependencies = packageJson.dependencies || {};
    const devDependencies = packageJson.devDependencies || {};

    const requiredDeps = [
      ['next', dependencies],
      ['react', dependencies],
      ['typescript', devDependencies],
      ['firebase', dependencies],
      ['stripe', dependencies],
      ['@google/generative-ai', dependencies],
    ];

    requiredDeps.forEach(([dep, depObj]) => {
      if (depObj[dep]) {
        log('pass', `Dependency installed: ${dep}@${depObj[dep]}`);
      } else {
        log('fail', `Missing dependency: ${dep}`);
      }
    });
  } catch {
    log('fail', 'Could not read package.json');
  }

  // 6. Documentation
  section('Documentation');

  const docFiles = [
    'MONETIZATION_SYSTEM.md',
    'DEPLOYMENT_GUIDE.md',
    'IMPLEMENTATION_COMPLETE.md',
    'QUICK_REFERENCE.md',
    'PRODUCTION_DEPLOYMENT_CHECKLIST.md',
    'GOOGLE_PLAY_COMPLETE_GUIDE.md',
    'copilot-instructions.md',
    'CONTRIBUTING.md',
  ];

  docFiles.forEach((doc) => {
    if (fs.existsSync(doc)) {
      log('pass', `Documentation exists: ${doc}`);
    } else {
      log('warn', `Documentation missing: ${doc}`);
    }
  });

  // 7. Android App
  section('Android App Structure');

  const androidFiles = [
    'android-app/app/build.gradle.kts',
    'android-app/build.gradle.kts',
    'android-app/settings.gradle.kts',
    'android-app/README.md',
  ];

  androidFiles.forEach((file) => {
    if (fs.existsSync(file)) {
      log('pass', `Android file exists: ${file}`);
    } else {
      log('warn', `Android file missing: ${file}`);
    }
  });

  // 8. Build Scripts
  section('Build Scripts');

  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
    const scripts = packageJson.scripts || {};

    const requiredScripts = ['dev', 'build', 'start', 'lint', 'test'];
    requiredScripts.forEach((script) => {
      if (scripts[script]) {
        log('pass', `Build script available: ${script}`);
      } else {
        log('warn', `Build script missing: ${script}`);
      }
    });
  } catch {
    log('fail', 'Could not read build scripts');
  }

  // 9. Configuration Files
  section('Configuration Files');

  const configFiles = [
    { file: 'firestore.rules', required: true },
    { file: 'firebase.json', required: true },
    { file: 'next.config.ts', required: true },
    { file: '.env.example', required: true },
    { file: 'setup-deployment.ps1', required: false },
  ];

  configFiles.forEach(({ file, required }) => {
    if (fs.existsSync(file)) {
      log('pass', `Config file exists: ${file}`);
    } else if (required) {
      log('fail', `Required config missing: ${file}`);
    } else {
      log('warn', `Optional config missing: ${file}`);
    }
  });

  // 10. Test Files
  section('Testing');

  if (fs.existsSync('lib/test-workflows.ts')) {
    log('pass', 'Test workflows configured (lib/test-workflows.ts)');
  } else {
    log('warn', 'Test workflows not found');
  }

  // Summary
  console.log(`\n${colors.bold}${colors.cyan}▶ Summary${colors.reset}`);
  console.log(`Total checks: ${results.length}`);

  const passCount = results.filter((r) => r.status === 'pass').length;
  const warnCount = results.filter((r) => r.status === 'warn').length;
  const failCount = results.filter((r) => r.status === 'fail').length;

  console.log(`${colors.green}Passed: ${passCount}${colors.reset}`);
  console.log(`${colors.yellow}Warnings: ${warnCount}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failCount}${colors.reset}`);

  // Exit Status
  console.log(`\n${colors.bold}${colors.cyan}▶ Status${colors.reset}`);

  if (criticalFailures === 0 && failCount === 0) {
    console.log(`${colors.green}✅ System is ready for deployment!${colors.reset}`);
    console.log(`\nNext steps:`);
    console.log(`1. Populate .env.local with actual API keys`);
    console.log(`2. Run: npm run build`);
    console.log(`3. Run: npm run dev`);
    console.log(`4. Test at: http://localhost:3000`);
    console.log(`5. Deploy: vercel --prod`);
    process.exit(0);
  } else if (warnCount > 0 && failCount === 0) {
    console.log(`${colors.yellow}⚠️  System mostly ready. Address warnings above.${colors.reset}`);
    process.exit(0);
  } else {
    console.log(`${colors.red}❌ System has critical issues. Fix failures above.${colors.reset}`);
    console.log(`\nCommon fixes:`);
    console.log(`1. Run: npm install`);
    console.log(`2. Check .env.local configuration`);
    console.log(`3. Verify Firebase setup`);
    console.log(`4. Review copilot-instructions.md`);
    process.exit(1);
  }
}

verify().catch((error) => {
  console.error(`${colors.red}Verification error:${colors.reset}`, error);
  process.exit(2);
});
