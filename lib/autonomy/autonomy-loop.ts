/**
 * 🔄 Autonomy Loop
 * Main execution engine where CEO Bot orchestrates autonomous operations
 * Handles decision-making, execution, learning, and policy enforcement
 */

import { CEOBot, ExecutionContext, CEODecision } from '@/lib/agents/ceo-bot';
import { captureException, captureMessage } from '@/lib/sentry';

export interface AutonomyLoopConfig {
  maxRetries: number;
  retryDelay: number; // ms
  learningEnabled: boolean;
  policyEnforcementLevel: 'strict' | 'moderate' | 'lenient';
  costCap: number; // max cost per operation in cents
}

export interface OperationResult {
  success: boolean;
  output: unknown;
  cost: number;
  executionTime: number;
  decisionsApplied: CEODecision[];
  errors: string[];
}

/**
 * Autonomy Loop - Executes operations under CEO Bot's guidance
 */
export class AutonomyLoop {
  private static instance: AutonomyLoop;
  private ceoBot = CEOBot.getInstance();
  private config: AutonomyLoopConfig = {
    maxRetries: 3,
    retryDelay: 1000,
    learningEnabled: true,
    policyEnforcementLevel: 'strict',
    costCap: 10000, // $100 per operation
  };
  private operationHistory: OperationResult[] = [];

  private constructor() {}

  static getInstance(): AutonomyLoop {
    if (!AutonomyLoop.instance) {
      AutonomyLoop.instance = new AutonomyLoop();
    }
    return AutonomyLoop.instance;
  }

  /**
   * Configure autonomy behavior
   */
  configure(config: Partial<AutonomyLoopConfig>): void {
    this.config = { ...this.config, ...config };
    captureMessage('Autonomy Loop configured', 'info');
  }

  /**
   * Execute an operation under CEO guidance
   */
  async executeOperation(context: ExecutionContext): Promise<OperationResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    const decisionsApplied: CEODecision[] = [];

    try {
      // Step 1: CEO makes decision about how to execute
      const decision = await this.ceoBot.makeDecision(context);
      decisionsApplied.push(decision);

      // Step 2: Check if we should proceed
      if (!decision.shouldProceed) {
        errors.push(`Autonomy blocked: ${decision.reasoning}`);
        
        // If approved_required, would need human approval here
        if (decision.autonomyLevel === 'approval_required') {
          captureMessage('Operation requires human approval', 'warn');
          throw new Error('Operation requires human approval');
        }
      }

      // Step 3: Enforce policies based on config
      const policyErrors = this.enforcePolicies(decision, this.config.policyEnforcementLevel);
      if (policyErrors.length > 0) {
        errors.push(...policyErrors);
        if (this.config.policyEnforcementLevel === 'strict') {
          throw new Error(`Policy violations: ${policyErrors.join(', ')}`);
        }
      }

      // Step 4: Check cost
      if (decision.selectedAgent.estimatedCost > this.config.costCap) {
        throw new Error(
          `Operation cost ${decision.selectedAgent.estimatedCost}¢ exceeds cap ${this.config.costCap}¢`
        );
      }

      // Step 5: Execute with retries
      let output: unknown = null;
      let lastError: Error | null = null;

      for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
        try {
          output = await this.executeWithAgent(decision, context);
          break; // Success, exit retry loop
        } catch (error) {
          lastError = error as Error;
          
          if (attempt < this.config.maxRetries) {
            captureMessage(
              `Autonomy execution attempt ${attempt} failed, retrying...`,
              'warn'
            );
            await this.sleep(this.config.retryDelay);
          }
        }
      }

      if (lastError && !output) {
        throw lastError;
      }

      // Step 6: Record learning
      if (this.config.learningEnabled && output) {
        this.ceoBot.recordOutcome(
          decision.selectedAgent.agentId,
          true,
          decision.selectedAgent.expectedQuality
        );
      }

      // Step 7: Return result
      const result: OperationResult = {
        success: true,
        output,
        cost: decision.selectedAgent.estimatedCost,
        executionTime: Date.now() - startTime,
        decisionsApplied,
        errors,
      };

      this.operationHistory.push(result);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      errors.push(errorMessage);
      
      captureException(error);

      const result: OperationResult = {
        success: false,
        output: null,
        cost: 0,
        executionTime: Date.now() - startTime,
        decisionsApplied,
        errors,
      };

      this.operationHistory.push(result);
      return result;
    }
  }

  /**
   * Execute using the selected agent
   */
  private async executeWithAgent(
    decision: CEODecision,
    context: ExecutionContext
  ): Promise<unknown> {
    // TODO: Route to specific agent based on decision.selectedAgent.agentId
    // For now, return mock execution
    
    captureMessage(
      `Executing with agent ${decision.selectedAgent.agentId} at ${decision.autonomyLevel} autonomy`,
      'debug'
    );

    await this.sleep(100); // Simulate work

    return {
      agentId: decision.selectedAgent.agentId,
      autonomyLevel: decision.autonomyLevel,
      completedAt: new Date().toISOString(),
    };
  }

  /**
   * Enforce policies based on enforcement level
   */
  private enforcePolicies(
    decision: CEODecision,
    enforcementLevel: string
  ): string[] {
    const errors: string[] = [];

    const criticalViolations = decision.policies.filter(p => p.severity === 'critical');
    const errorViolations = decision.policies.filter(p => p.severity === 'error');
    const warningViolations = decision.policies.filter(p => p.severity === 'warning');

    if (criticalViolations.length > 0) {
      errors.push(
        ...criticalViolations.map(p => `[CRITICAL] ${p.message}`)
      );
    }

    if (enforcementLevel === 'strict' && errorViolations.length > 0) {
      errors.push(
        ...errorViolations.map(p => `[ERROR] ${p.message}`)
      );
    }

    if (enforcementLevel === 'strict' && warningViolations.length > 0) {
      captureMessage(
        `Policy warnings: ${warningViolations.map(p => p.message).join('; ')}`,
        'warn'
      );
    }

    return errors;
  }

  /**
   * Get operation history
   */
  getHistory(limit: number = 100): OperationResult[] {
    return this.operationHistory.slice(-limit);
  }

  /**
   * Get autonomy statistics
   */
  getStats() {
    const total = this.operationHistory.length;
    const successful = this.operationHistory.filter(r => r.success).length;
    const totalCost = this.operationHistory.reduce((sum, r) => sum + r.cost, 0);
    const avgExecutionTime =
      total > 0
        ? this.operationHistory.reduce((sum, r) => sum + r.executionTime, 0) / total
        : 0;

    return {
      totalOperations: total,
      successRate: total > 0 ? (successful / total * 100).toFixed(2) + '%' : '0%',
      totalCost: (totalCost / 100).toFixed(2) + '$',
      avgExecutionTime: avgExecutionTime.toFixed(0) + 'ms',
    };
  }

  /**
   * Clear history
   */
  clearHistory(): void {
    this.operationHistory = [];
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton
export const autonomyLoop = AutonomyLoop.getInstance();

export default AutonomyLoop;
