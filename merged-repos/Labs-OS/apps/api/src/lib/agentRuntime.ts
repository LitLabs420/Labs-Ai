import { Prisma, PrismaClient } from "@prisma/client";
import { getAIModel } from "./aiIntegration";
import { getToolRegistry } from "./toolRegistry";
import { publishTaskUpdate } from "./natsBus";

export enum AgentStatus {
  IDLE = "IDLE",
  RUNNING = "RUNNING",
  ERROR = "ERROR",
  PAUSED = "PAUSED",
  SHUTDOWN = "SHUTDOWN",
}

export interface ExecutionContext {
  agentId: string;
  taskId?: string;
  userId?: string;
  timestamp: number;
  attemptNumber: number;
  metadata: Record<string, unknown>;
}

export interface ExecutionResult {
  success: boolean;
  output?: unknown;
  error?: string;
  reasoning?: string;
  tokenUsage: {
    input: number;
    output: number;
    total: number;
  };
  costUsd: number;
  durationMs: number;
  toolCalls: Array<{
    name: string;
    input: Record<string, unknown>;
    output?: unknown;
    error?: string;
  }>;
}

/**
 * Base Agent Runtime
 * Provides lifecycle management, execution orchestration, and resilience patterns
 */
export abstract class AgentRuntime {
  protected agentId: string;
  protected agentType: string;
  protected status: AgentStatus = AgentStatus.IDLE;
  protected db: PrismaClient;
  protected config: {
    maxRetries: number;
    retryDelayMs: number;
    timeoutMs: number;
    model: string;
    temperature: number;
    maxTokens: number;
  };

  constructor(
    agentId: string,
    agentType: string,
    db: PrismaClient,
    config?: Partial<typeof this.config>
  ) {
    this.agentId = agentId;
    this.agentType = agentType;
    this.db = db;
    this.config = {
      maxRetries: config?.maxRetries ?? 3,
      retryDelayMs: config?.retryDelayMs ?? 1000,
      timeoutMs: config?.timeoutMs ?? 30000,
      model: config?.model ?? "gemini-2.0-flash",
      temperature: config?.temperature ?? 0.7,
      maxTokens: config?.maxTokens ?? 2000,
    };
  }

  // ==================== Lifecycle Hooks ====================

  protected async onInitialize(): Promise<void> {
    // Override in subclass
  }

  protected abstract onPreprocess(
    input: Record<string, unknown>
  ): Promise<Record<string, unknown>>;

  protected abstract onExecute(
    processedInput: Record<string, unknown>,
    context: ExecutionContext
  ): Promise<ExecutionResult>;

  protected async onPostprocess(
    result: ExecutionResult,
    context: ExecutionContext
  ): Promise<ExecutionResult> {
    // Override in subclass
    return result;
  }

  protected async onSuccess(
    result: ExecutionResult,
    context: ExecutionContext
  ): Promise<void> {
    // Override in subclass
  }

  protected async onError(
    error: Error,
    context: ExecutionContext
  ): Promise<void> {
    // Override in subclass
    console.error(`Agent ${this.agentId} error:`, error);
  }

  protected async onShutdown(): Promise<void> {
    // Override in subclass
  }

  // ==================== Main Execution Flow ====================

  public async execute(
    input: Record<string, unknown>,
    context?: Partial<ExecutionContext>
  ): Promise<ExecutionResult> {
    const executionContext: ExecutionContext = {
      agentId: this.agentId,
      userId: context?.userId,
      taskId: context?.taskId,
      timestamp: context?.timestamp ?? Date.now(),
      attemptNumber: context?.attemptNumber ?? 1,
      metadata: context?.metadata ?? {},
    };

    const startTime = Date.now();
    let execution: any = null;

    try {
      this.status = AgentStatus.RUNNING;

      // Create execution record
      execution = await this.db.agentExecution.create({
        data: {
          agentId: this.agentId,
          taskId: executionContext.taskId,
          input: JSON.stringify(input),
          context: JSON.stringify(executionContext.metadata),
          systemPromptUsed: "default", // Will be set in subclass
          modelUsed: this.config.model,
          status: "RUNNING",
          startedAt: new Date(),
        },
      });

      // Preprocess input
      const processedInput = await this.onPreprocess(input);

      // Execute with timeout and retry logic
      let result = await this.executeWithRetry(
        processedInput,
        executionContext
      );

      // Postprocess result
      result = await this.onPostprocess(result, executionContext);

      // Update execution record
      await this.db.agentExecution.update({
        where: { id: execution.id },
        data: {
          status: "SUCCESS",
          output: JSON.stringify(result.output),
          reasoning: result.reasoning,
          completedAt: new Date(),
          durationMs: Date.now() - startTime,
          inputTokens: result.tokenUsage.input,
          outputTokens: result.tokenUsage.output,
          totalTokens: result.tokenUsage.total,
          costUsd: result.costUsd,
        },
      });

      // Success hook
      await this.onSuccess(result, executionContext);

      // Publish success event
      await publishTaskUpdate("agent.execution.success", {
        agentId: this.agentId,
        executionId: execution.id,
        durationMs: Date.now() - startTime,
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      // Error hook
      if (error instanceof Error) {
        await this.onError(error, executionContext);
      }

      // Update execution record with failure
      if (execution) {
        await this.db.agentExecution.update({
          where: { id: execution.id },
          data: {
            status: "FAILURE",
            error: errorMessage,
            completedAt: new Date(),
            durationMs: duration,
          },
        });
      }

      // Publish failure event
      await publishTaskUpdate("agent.execution.failure", {
        agentId: this.agentId,
        executionId: execution?.id,
        error: errorMessage,
        durationMs: duration,
      });

      throw error;
    } finally {
      this.status = AgentStatus.IDLE;
    }
  }

  // ==================== Retry Logic ====================

  private async executeWithRetry(
    input: Record<string, unknown>,
    context: ExecutionContext
  ): Promise<ExecutionResult> {
    let lastError: Error | null = null;
    let result: ExecutionResult | null = null;

    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        return await this.executeWithTimeout(input, context);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        context.attemptNumber = attempt;

        if (attempt < this.config.maxRetries) {
          // Exponential backoff
          const delayMs = this.config.retryDelayMs * Math.pow(2, attempt - 1);
          await this.sleep(delayMs);
        }
      }
    }

    throw lastError ?? new Error("Execution failed after retries");
  }

  private executeWithTimeout(
    input: Record<string, unknown>,
    context: ExecutionContext
  ): Promise<ExecutionResult> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(
        () => reject(new Error("Execution timeout")),
        this.config.timeoutMs
      );

      this.onExecute(input, context)
        .then((result) => {
          clearTimeout(timeout);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timeout);
          reject(error);
        });
    });
  }

  // ==================== Utility Methods ====================

  protected async callTool(
    toolName: string,
    args: Record<string, unknown>,
    executionId: string
  ): Promise<unknown> {
    const registry = getToolRegistry();
    const tool = registry.getTool(toolName);

    if (!tool) {
      throw new Error(`Unknown tool: ${toolName}`);
    }

    // Validate arguments
    if (tool.validate) {
      const validation = tool.validate(args);
      if (!validation.valid) {
        throw new Error(`Invalid arguments for ${toolName}: ${validation.error}`);
      }
    }

    // Log tool call
    const toolCall = await this.db.toolCall.create({
      data: {
        agentId: this.agentId,
        executionId,
        toolName,
        toolVersion: "1.0",
        arguments: JSON.stringify(args),
        status: "RUNNING",
        createdAt: new Date(),
      },
    });

    try {
      const startTime = Date.now();
      const result = await tool.execute(args);

      // Update tool call with result
      await this.db.toolCall.update({
        where: { id: toolCall.id },
        data: {
          status: "SUCCESS",
          result: JSON.stringify(result),
          durationMs: Date.now() - startTime,
          completedAt: new Date(),
        },
      });

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      await this.db.toolCall.update({
        where: { id: toolCall.id },
        data: {
          status: "FAILURE",
          error: errorMessage,
          durationMs: Date.now(),
          completedAt: new Date(),
        },
      });
      throw error;
    }
  }

  protected async callAI(
    prompt: string,
    systemPrompt?: string
  ): Promise<{ text: string; tokenUsage: { input: number; output: number } }> {
    const model = getAIModel(this.config.model);
    return model.generate(
      prompt,
      {
        systemPrompt: systemPrompt ?? "You are a helpful AI assistant.",
        temperature: this.config.temperature,
        maxTokens: this.config.maxTokens,
      },
      this.config.model
    );
  }

  protected async updateMetric(
    metric: string,
    value: number
  ): Promise<void> {
    const now = new Date();
    const period = now.toISOString().slice(0, 13); // Hourly bucket

    await this.db.agentMetric.create({
      data: {
        agentId: this.agentId,
        metric,
        value,
        hourly: true,
        daily: true,
        timestamp: now,
        period,
      },
    });
  }

  protected getStatus(): AgentStatus {
    return this.status;
  }

  public async initialize(): Promise<void> {
    await this.onInitialize();
    this.status = AgentStatus.IDLE;
  }

  public async shutdown(): Promise<void> {
    await this.onShutdown();
    this.status = AgentStatus.SHUTDOWN;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
