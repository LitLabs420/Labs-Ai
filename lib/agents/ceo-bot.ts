/**
 * 🤖 CEO Bot Infrastructure
 * The autonomous decision-making system that orchestrates all agents
 * Manages agent selection, cost optimization, policy enforcement, and autonomy loops
 */

import { captureException } from '@/lib/sentry';

export interface AgentCapability {
  id: string;
  name: string;
  category: 'code' | 'content' | 'data' | 'analysis' | 'automation' | 'reasoning';
  description: string;
  costPerCall: number; // in cents
  trustScore: number; // 0-100
  successRate: number; // 0-100
  maxContextTokens: number;
  specializations: string[]; // e.g., ['python', 'typescript', 'sql']
}

export interface AgentSelection {
  agentId: string;
  reason: string;
  estimatedCost: number;
  expectedQuality: number; // 0-100
}

export interface CEODecision {
  selectedAgent: AgentSelection;
  shouldProceed: boolean;
  reasoning: string;
  policies: PolicyViolation[];
  autonomyLevel: 'full' | 'supervised' | 'approval_required';
}

export interface PolicyViolation {
  policyId: string;
  rule: string;
  severity: 'warning' | 'error' | 'critical';
  message: string;
  suggestedResolution?: string;
}

export interface ExecutionContext {
  userId: string;
  taskId: string;
  capability: string;
  budget: number; // remaining budget in cents
  timeLimit: number; // in milliseconds
  requiredQuality: number; // 0-100
  constraints: Record<string, unknown>;
}

/**
 * CEO Bot - Makes autonomous decisions about agent selection and execution
 */
export class CEOBot {
  private static instance: CEOBot;
  private agentRegistry: Map<string, AgentCapability> = new Map();
  private learningHistory: Map<string, number[]> = new Map(); // agent -> success rates
  private costOptimizer: CostOptimizer;

  private constructor() {
    this.costOptimizer = new CostOptimizer();
  }

  /**
   * Singleton instance
   */
  static getInstance(): CEOBot {
    if (!CEOBot.instance) {
      CEOBot.instance = new CEOBot();
    }
    return CEOBot.instance;
  }

  /**
   * Register an agent capability
   */
  registerAgent(capability: AgentCapability): void {
    this.agentRegistry.set(capability.id, capability);
    this.learningHistory.set(capability.id, [capability.successRate]);
  }

  /**
   * Get all registered agents
   */
  getAgents(): AgentCapability[] {
    return Array.from(this.agentRegistry.values());
  }

  /**
   * Get agents by category
   */
  getAgentsByCategory(category: AgentCapability['category']): AgentCapability[] {
    return Array.from(this.agentRegistry.values())
      .filter(a => a.category === category);
  }

  /**
   * Main decision-making function
   * CEO decides: which agent, whether to proceed, and at what autonomy level
   */
  async makeDecision(context: ExecutionContext): Promise<CEODecision> {
    try {
      // Step 1: Find suitable agents for the capability
      const suitableAgents = this.findSuitableAgents(context);
      
      if (suitableAgents.length === 0) {
        throw new Error(`No suitable agents found for capability: ${context.capability}`);
      }

      // Step 2: Apply policy checks
      const violations = await this.checkPolicies(context);
      
      // Step 3: Optimize agent selection based on cost/quality
      const selectedAgent = this.costOptimizer.selectOptimalAgent(
        suitableAgents,
        context,
        this.learningHistory
      );

      // Step 4: Determine autonomy level
      const autonomyLevel = this.determineAutonomyLevel(
        context,
        violations,
        selectedAgent
      );

      // Step 5: Build decision
      const decision: CEODecision = {
        selectedAgent,
        shouldProceed: violations.filter(v => v.severity === 'critical').length === 0,
        reasoning: this.buildReasoning(selectedAgent, context, violations),
        policies: violations,
        autonomyLevel,
      };

      return decision;
    } catch (error) {
      captureException(error);
      throw error;
    }
  }

  /**
   * Find agents suitable for a task
   */
  private findSuitableAgents(context: ExecutionContext): AgentCapability[] {
    const allAgents = Array.from(this.agentRegistry.values());
    
    return allAgents.filter(agent => {
      // Agent must have the required capability
      if (!agent.specializations.some(s => 
        context.capability.toLowerCase().includes(s.toLowerCase()) ||
        s.toLowerCase().includes(context.capability.toLowerCase())
      )) {
        return false;
      }

      // Agent cost must fit budget
      if (agent.costPerCall > context.budget) {
        return false;
      }

      // Agent must meet minimum quality requirement
      if (agent.successRate < context.requiredQuality) {
        return false;
      }

      return true;
    });
  }

  /**
   * Check policies and constraints
   */
  private async checkPolicies(context: ExecutionContext): Promise<PolicyViolation[]> {
    const violations: PolicyViolation[] = [];

    // Policy 1: Budget constraint
    const selectedAgents = this.findSuitableAgents(context);
    if (selectedAgents.length > 0) {
      const minCost = Math.min(...selectedAgents.map(a => a.costPerCall));
      if (minCost > context.budget) {
        violations.push({
          policyId: 'budget_constraint',
          rule: 'Minimum agent cost must be within budget',
          severity: 'error',
          message: `Minimum cost ${minCost}¢ exceeds budget ${context.budget}¢`,
          suggestedResolution: 'Increase budget or request lower-cost operation',
        });
      }
    }

    // Policy 2: Time constraint
    if (context.timeLimit < 5000) { // 5 second minimum
      violations.push({
        policyId: 'time_constraint',
        rule: 'Minimum time limit is 5 seconds',
        severity: 'warning',
        message: `Time limit ${context.timeLimit}ms is very tight`,
        suggestedResolution: 'Consider increasing time limit for better results',
      });
    }

    // Policy 3: Quality requirement
    if (context.requiredQuality > 95) {
      violations.push({
        policyId: 'quality_requirement',
        rule: 'Quality above 95% may be unrealistic',
        severity: 'warning',
        message: `Required quality ${context.requiredQuality}% is very high`,
        suggestedResolution: 'Consider relaxing quality requirements slightly',
      });
    }

    return violations;
  }

  /**
   * Determine autonomy level for execution
   */
  private determineAutonomyLevel(
    context: ExecutionContext,
    violations: PolicyViolation[],
    agent: AgentSelection
  ): 'full' | 'supervised' | 'approval_required' {
    // Full autonomy for low-risk, high-trust scenarios
    if (
      agent.estimatedCost < 100 && // < $1
      violations.length === 0 &&
      agent.expectedQuality > 80
    ) {
      return 'full';
    }

    // Supervised for medium-risk scenarios
    if (
      agent.estimatedCost < 1000 && // < $10
      violations.filter(v => v.severity === 'critical').length === 0 &&
      agent.expectedQuality > 70
    ) {
      return 'supervised';
    }

    // Require approval for high-risk scenarios
    return 'approval_required';
  }

  /**
   * Build reasoning explanation
   */
  private buildReasoning(
    agent: AgentSelection,
    context: ExecutionContext,
    violations: PolicyViolation[]
  ): string {
    const parts: string[] = [];

    parts.push(`Selected agent: ${agent.agentId} (${agent.reason})`);
    parts.push(`Estimated cost: ${(agent.estimatedCost / 100).toFixed(2)}$`);
    parts.push(`Expected quality: ${agent.expectedQuality}%`);

    if (violations.length > 0) {
      parts.push(`\nPolicy violations: ${violations.length}`);
      violations.forEach(v => {
        parts.push(`  - [${v.severity.toUpperCase()}] ${v.message}`);
      });
    }

    return parts.join('\n');
  }

  /**
   * Record execution outcome for learning
   */
  recordOutcome(agentId: string, success: boolean, qualityScore: number): void {
    const history = this.learningHistory.get(agentId) || [];
    history.push(qualityScore);
    
    // Keep last 100 outcomes
    if (history.length > 100) {
      history.shift();
    }
    
    this.learningHistory.set(agentId, history);
  }

  /**
   * Get agent performance metrics
   */
  getAgentMetrics(agentId: string) {
    const agent = this.agentRegistry.get(agentId);
    const history = this.learningHistory.get(agentId) || [];

    if (!agent) return null;

    const avgQuality = history.length > 0 
      ? history.reduce((a, b) => a + b, 0) / history.length 
      : agent.successRate;

    return {
      agent,
      avgQuality: Math.round(avgQuality),
      executionCount: history.length,
      trend: this.calculateTrend(history),
    };
  }

  /**
   * Calculate performance trend (improving/stable/declining)
   */
  private calculateTrend(history: number[]): 'improving' | 'stable' | 'declining' {
    if (history.length < 3) return 'stable';

    const recent = history.slice(-10);
    const older = history.slice(-20, -10);

    if (older.length === 0) return 'stable';

    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;

    const difference = recentAvg - olderAvg;
    if (difference > 5) return 'improving';
    if (difference < -5) return 'declining';
    return 'stable';
  }
}

/**
 * Cost Optimizer
 * Uses multi-armed bandit approach to select optimal agent
 */
class CostOptimizer {
  /**
   * Select the optimal agent using UCB (Upper Confidence Bound) algorithm
   */
  selectOptimalAgent(
    candidates: AgentCapability[],
    context: ExecutionContext,
    history: Map<string, number[]>
  ): AgentSelection {
    let bestScore = -Infinity;
    let bestAgent: AgentCapability | null = null;

    for (const agent of candidates) {
      const score = this.calculateScore(agent, context, history);
      if (score > bestScore) {
        bestScore = score;
        bestAgent = agent;
      }
    }

    if (!bestAgent) {
      throw new Error('No suitable agents found');
    }

    return {
      agentId: bestAgent.id,
      reason: `High score (${bestScore.toFixed(2)}) - Trust: ${bestAgent.trustScore}%, Cost: ${(bestAgent.costPerCall / 100).toFixed(2)}$`,
      estimatedCost: bestAgent.costPerCall,
      expectedQuality: bestAgent.successRate,
    };
  }

  /**
   * UCB score: balances exploitation (known good agents) with exploration (new agents)
   */
  private calculateScore(
    agent: AgentCapability,
    context: ExecutionContext,
    history: Map<string, number[]>
  ): number {
    const agentHistory = history.get(agent.id) || [];
    const executionCount = agentHistory.length + 1;

    // Exploitation: average quality from history
    const exploitation = agentHistory.length > 0
      ? agentHistory.reduce((a, b) => a + b, 0) / agentHistory.length
      : agent.successRate;

    // Exploration: encourage trying less-used agents
    const exploration = Math.sqrt(Math.log(executionCount) / executionCount);

    // Cost efficiency: prefer cheaper agents when quality is similar
    const costFactor = 1 - (agent.costPerCall / context.budget) * 0.1;

    // Trust score: agent reputation matters
    const trustFactor = agent.trustScore / 100;

    // Combined score
    return (exploitation + exploration * 10) * costFactor * trustFactor;
  }
}

// Export singleton
export const ceoBot = CEOBot.getInstance();

export default CEOBot;
