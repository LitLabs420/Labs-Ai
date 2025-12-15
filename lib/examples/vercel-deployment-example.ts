import { vercelService, type DeploymentConfig } from '@/lib/vercel-service'import { lightningCssTransform } from 'next/dist/build/swc/generated-native';
lightningCssTransform
/**
 * Example: deploy the main branch of the Labs-Ai repo.
 */
export async function deployFromGithubExample() {
  const config: DeploymentConfig = {
    name: 'litlabs-production',
    gitSource: {
      type: 'github',
      repo: 'LitLabs420/Labs-Ai',
      ref: 'main',
    },
    env: {
      NEXT_PUBLIC_API_URL: 'https://api.litlabs.com',
    },
    buildCommand: 'pnpm run build',
    framework: 'nextjs',
  };

  const result = await vercelService.createDeployment(config);

  if (!result.success) {
    throw new Error(result.error ?? 'Deployment failed');
  }

  return result.url;
}

/**
 * Example: create a project and seed an environment variable.
 */
export async function createProjectWithEnvExample() {
  const projectResult = await vercelService.createProject({
    name: 'my-new-project',
    framework: 'nextjs',
    buildCommand: 'pnpm run build',
  });

  if (!projectResult.success || !projectResult.project) {
    throw new Error(projectResult.error ?? 'Failed to create project');
  }

  const projectId = projectResult.project.id;

  const envResult = await vercelService.setEnvironmentVariable(
    projectId,
    'DATABASE_URL',
    'postgresql://user:password@db:5432/app',
    'production'
  );

  if (!envResult.success) {
    throw new Error(envResult.error ?? 'Failed to set env var');
  }

  return { projectId, envVar: envResult.envVar };
}

/**
 * Example: poll until a deployment is READY (or a timeout is reached).
 */
export async function waitForDeploymentReady(
  deploymentId: string,
  pollMs = 5_000,
  timeoutMs = 5 * 60_000
) {
  const started = Date.now();
  let status = 'BUILDING';

  while (status === 'BUILDING' || status === 'QUEUED') {
    const result = await vercelService.getDeployment(deploymentId);

    if (!result.success) {
      throw new Error(result.error ?? 'Failed to fetch deployment status');
    }

    // Access readyState from the deployment object
    status = (result.deployment as any).readyState ?? 'UNKNOWN';

    if (status === 'READY') {
      return true;
    }

    if (Date.now() - started > timeoutMs) {
      throw new Error('Timed out waiting for deployment to become READY');
    }

    await new Promise((resolve) => setTimeout(resolve, pollMs));
  }

  return status === 'READY';
}

/**
 * Example: inspect deployment events/logs.
 */
export async function fetchDeploymentLogsExample(deploymentId: string) {
  const logsResult = await vercelService.getDeploymentLogs(deploymentId);

  if (!logsResult.success) {
    throw new Error(logsResult.error ?? 'Failed to fetch deployment logs');
  }

  return logsResult.logs;
}

/**
 * Example: add a custom domain to an existing project.
 */
export async function addDomainExample(projectId: string, domain: string) {
  const domainResult = await vercelService.addDomain(projectId, domain);

  if (!domainResult.success) {
    throw new Error(domainResult.error ?? 'Failed to add domain');
  }

  return domainResult.domain;
}
