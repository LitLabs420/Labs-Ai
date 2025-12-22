import { PrismaClient } from "@prisma/client";
import { AgentRuntime, ExecutionContext, ExecutionResult } from "../agentRuntime";
import { getToolRegistry } from "../toolRegistry";

export class MarketAgent extends AgentRuntime {
  private systemPrompt = `You are an expert marketplace agent specializing in:
- Market analysis and pricing trends
- Listing creation and optimization
- Competitive intelligence
- Revenue optimization`;

  constructor(db: PrismaClient, agentId?: string) {
    const id = agentId || `market-agent-${Date.now()}`;
    super(id, "MARKET", db, {
      model: "gemini-2.0-flash",
      temperature: 0.6,
      maxTokens: 1500,
    });
  }

  protected async onInitialize(): Promise<void> {
    console.log(`[MarketAgent] Initializing agent`);
  }

  protected async onPreprocess(
    input: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    if (!input.action) {
      throw new Error("Market action not specified");
    }
    return {
      ...input,
      timestamp: new Date().toISOString(),
    };
  }

  protected async onExecute(
    input: Record<string, unknown>,
    context: ExecutionContext
  ): Promise<ExecutionResult> {
    const action = input.action as string;
    const startTime = Date.now();

    const toolCalls: ExecutionResult["toolCalls"] = [];

    switch (action) {
      case "analyze_market":
        await this.callTool("analyze_market_price", {}, context.taskId || "");
        break;
      case "create_listing":
        await this.callTool("create_listing", {}, context.taskId || "");
        break;
    }

    return {
      success: true,
      output: { action, status: "completed" },
      durationMs: Date.now() - startTime,
      tokenUsage: { input: 100, output: 50, total: 150 },
      costUsd: 0.001,
      toolCalls,
    };
  }

  protected async onPostprocess(
    result: ExecutionResult,
    _context: ExecutionContext
  ): Promise<ExecutionResult> {
    return result;
  }

  protected async onSuccess(
    _result: ExecutionResult,
    _context: ExecutionContext
  ): Promise<void> {
    await this.updateMetric("market_operations", 1);
  }

  protected async onError(
    error: Error,
    _context: ExecutionContext
  ): Promise<void> {
    console.error("[MarketAgent] Error:", error.message);
    await this.updateMetric("market_errors", 1);
  }
}
