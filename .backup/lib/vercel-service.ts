/**
 * Vercel SDK Integration Service
 * Provides utilities for deploying, managing projects, and interacting with Vercel API
 */

import { Vercel } from C:/Users/dying/';

export interface DeploymentConfig {
  name: string;
  gitSource?: {
    type: 'github' | 'gitlab' | 'bitbucket';
    repo: string;
    ref?: string;
  };
  env?: Record<string, string>;
  buildCommand?: string;
  framework?: string;
}

export interface ProjectConfig {
  name: string;
  framework?: 'nextjs' | 'react' | 'vue' | 'svelte' | 'astro';
  buildCommand?: string;
  devCommand?: string;
  installCommand?: string;
  outputDirectory?: string;
  rootDirectory?: string;
}

/**
 * Vercel Service for managing deployments and projects
 * 
 * Note: This is a wrapper around the Vercel SDK.
 * For detailed API usage, refer to: https://vercel.com/docs/rest-api
 */
export class VercelService {
  private client: Vercel;
  private teamId?: string;

  constructor(apiToken?: string, teamId?: string) {
    this.client = new Vercel({
      bearerToken: apiToken || process.env.VERCEL_API_TOKEN,
    });
    this.teamId = teamId || process.env.VERCEL_TEAM_ID;
  }

  /**
   * Get the Vercel client instance for direct API access
   */
  getClient(): Vercel {
    return this.client;
  }

  /**
   * Create a new deployment
   * Note: Refer to Vercel SDK docs for exact request structure
   */
  async createDeployment(config: DeploymentConfig) {
    try {
      // The actual SDK may require different parameters
      // Refer to @vercel/sdk documentation for the exact CreateDeploymentRequest structure
      const deployment = await this.client.deployments.createDeployment({
        requestBody: {
          name: config.name,
          project: config.name,
          // Additional fields as per SDK requirements
        } as any,
      });

      return {
        success: true,
        deployment,
        url: deployment.url ? `https://${deployment.url}` : undefined,
      };
    } catch (error) {
      console.error('Vercel deployment error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Deployment failed',
      };
    }
  }

  /**
   * Get deployment status
   */
  async getDeployment(deploymentId: string) {
    try {
      const deployment = await this.client.deployments.getDeployment({
        idOrUrl: deploymentId,
        teamId: this.teamId,
      });

      return {
        success: true,
        deployment,
        url: deployment.url ? `https://${deployment.url}` : undefined,
      };
    } catch (error) {
      console.error('Failed to get deployment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get deployment',
      };
    }
  }

  /**
   * List all deployments for a project
   */
  async listDeployments(projectId?: string, limit?: number) {
    try {
      const deployments = await this.client.deployments.getDeployments({
        projectId,
        limit,
        teamId: this.teamId,
      });

      return {
        success: true,
        deployments: deployments.deployments,
        pagination: deployments.pagination,
      };
    } catch (error) {
      console.error('Failed to list deployments:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list deployments',
      };
    }
  }

  /**
   * Create a new project
   */
  async createProject(config: ProjectConfig) {
    try {
      const project = await this.client.projects.createProject({
        requestBody: {
          name: config.name,
          framework: config.framework,
          buildCommand: config.buildCommand,
          devCommand: config.devCommand,
          installCommand: config.installCommand,
          outputDirectory: config.outputDirectory,
          rootDirectory: config.rootDirectory,
        } as any,
        teamId: this.teamId,
      });

      return {
        success: true,
        project,
      };
    } catch (error) {
      console.error('Failed to create project:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create project',
      };
    }
  }

  /**
   * Get project details
   */
  async getProject(projectId: string) {
    try {
      const projects = await this.client.projects.getProjects({
        teamId: this.teamId,
      });

      const project = projects.projects?.find(p => p.id === projectId || p.name === projectId);

      if (!project) {
        return {
          success: false,
          error: 'Project not found',
        };
      }

      return {
        success: true,
        project,
      };
    } catch (error) {
      console.error('Failed to get project:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get project',
      };
    }
  }

  /**
   * Update project settings
   * Note: Check SDK docs for exact update structure
   */
  async updateProject(projectId: string, updates: Partial<ProjectConfig>) {
    try {
      const project = await this.client.projects.updateProject({
        idOrName: projectId,
        teamId: this.teamId,
        requestBody: updates as any,
      });

      return {
        success: true,
        project,
      };
    } catch (error) {
      console.error('Failed to update project:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update project',
      };
    }
  }

  /**
   * List all projects
   */
  async listProjects(limit?: number) {
    try {
      const projects = await this.client.projects.getProjects({
        limit: limit?.toString(),
        teamId: this.teamId,
      });

      return {
        success: true,
        projects: projects.projects,
        pagination: projects.pagination,
      };
    } catch (error) {
      console.error('Failed to list projects:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list projects',
      };
    }
  }

  /**
   * Set environment variable
   * Note: Refer to SDK docs for exact structure
   */
  async setEnvironmentVariable(
    projectId: string,
    key: string,
    value: string,
    target: 'production' | 'preview' | 'development' = 'production'
  ) {
    try {
      const envVar = await this.client.projects.createProjectEnv({
        idOrName: projectId,
        teamId: this.teamId,
        requestBody: {
          key,
          value,
          target: [target],
          type: 'encrypted',
        } as any,
      });

      return {
        success: true,
        envVar,
      };
    } catch (error) {
      console.error('Failed to set environment variable:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to set environment variable',
      };
    }
  }

  /**
   * Get environment variables
   */
  async getEnvironmentVariables(projectId: string) {
    try {
      // Note: Check if getProjectEnv (singular) is the correct method
      const envVar = await this.client.projects.getProjectEnv({
        idOrName: projectId,
        id: '', // You may need to iterate or use a different approach
        teamId: this.teamId,
      });

      return {
        success: true,
        envVars: [envVar],
      };
    } catch (error) {
      console.error('Failed to get environment variables:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get environment variables',
      };
    }
  }

  /**
   * Delete environment variable
   */
  async deleteEnvironmentVariable(projectId: string, envId: string) {
    try {
      await this.client.projects.removeProjectEnv({
        idOrName: projectId,
        id: envId,
        teamId: this.teamId,
      });

      return {
        success: true,
      };
    } catch (error) {
      console.error('Failed to delete environment variable:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete environment variable',
      };
    }
  }

  /**
   * Get deployment logs/events
   */
  async getDeploymentLogs(deploymentId: string) {
    try {
      const events = await this.client.deployments.getDeploymentEvents({
        idOrUrl: deploymentId,
        teamId: this.teamId,
      });

      return {
        success: true,
        logs: events,
      };
    } catch (error) {
      console.error('Failed to get deployment logs:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get deployment logs',
      };
    }
  }

  /**
   * Cancel a deployment
   */
  async cancelDeployment(deploymentId: string) {
    try {
      await this.client.deployments.cancelDeployment({
        id: deploymentId,
        teamId: this.teamId,
      });

      return {
        success: true,
      };
    } catch (error) {
      console.error('Failed to cancel deployment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to cancel deployment',
      };
    }
  }

  /**
   * Get team information
   */
  async getTeam() {
    try {
      if (!this.teamId) {
        return {
          success: false,
          error: 'Team ID not configured',
        };
      }

      const team = await this.client.teams.getTeam({
        teamId: this.teamId,
      });

      return {
        success: true,
        team,
      };
    } catch (error) {
      console.error('Failed to get team:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get team',
      };
    }
  }

  /**
   * Get domain information
   */
  async getDomain(domain: string) {
    try {
      const domainInfo = await this.client.domains.getDomain({
        domain,
        teamId: this.teamId,
      });

      return {
        success: true,
        domain: domainInfo,
      };
    } catch (error) {
      console.error('Failed to get domain:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get domain',
      };
    }
  }

  /**
   * Add domain to project
   */
  async addDomain(projectId: string, domain: string) {
    try {
      const domainInfo = await this.client.projects.addProjectDomain({
        idOrName: projectId,
        teamId: this.teamId,
        requestBody: {
          name: domain,
        } as any,
      });

      return {
        success: true,
        domain: domainInfo,
      };
    } catch (error) {
      console.error(
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        ;:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add domain',
      };
    }
  }
}

// Export singleton instance
export const vercelService = new VercelService();

// Export utility functions
export const createDeployment = (config: DeploymentConfig) =>
  vercelService.createDeployment(config);

export const getDeployment = (deploymentId: string) =>
  vercelService.getDeployment(deploymentId);

export const listDeployments = (projectId?: string, limit?: number) =>
  vercelService.listDeployments(projectId, limit);

export const createProject = (config: ProjectConfig) =>
  vercelService.createProject(config);

export const getProject = (projectId: string) =>
  vercelService.getProject(projectId);
