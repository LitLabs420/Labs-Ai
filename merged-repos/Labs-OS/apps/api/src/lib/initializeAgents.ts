import { PrismaClient } from "@prisma/client";
import { initializeToolRegistry } from "./toolRegistry";
import { initializeAIModels } from "./aiIntegration";
import { initializeAgentWorker } from "./agentWorker";

const db = new PrismaClient();

/**
 * Initialize the entire Drop 7 AI Agent Runtime system
 * Call this once during application startup
 */
export async function initializeAgentSystem(): Promise<void> {
  console.log("\n╔════════════════════════════════════════════════════════════╗");
  console.log("║         DROP 7: AI AGENT RUNTIME INITIALIZATION           ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");

  try {
    // Step 1: Initialize tool registry
    console.log("[1/4] Initializing Tool Registry...");
    initializeToolRegistry(db);
    console.log("      ✓ 13 tools registered\n");

    // Step 2: Initialize AI models
    console.log("[2/4] Initializing AI Models...");
    initializeAIModels();
    console.log("      ✓ AI models ready\n");

    // Step 3: Create or verify default agents
    console.log("[3/4] Initializing Agent Definitions...");
    await initializeDefaultAgents();
    console.log("      ✓ Agent definitions synchronized\n");

    // Step 4: Start worker process
    console.log("[4/4] Starting Agent Task Worker...");
    await initializeAgentWorker();
    console.log("      ✓ Worker subscribed to agent.tasks\n");

    console.log("╔════════════════════════════════════════════════════════════╗");
    console.log("║           AGENT SYSTEM READY FOR OPERATIONS               ║");
    console.log("╚════════════════════════════════════════════════════════════╝\n");
  } catch (error) {
    console.error("[ERROR] Failed to initialize agent system:", error);
    process.exit(1);
  }
}

async function initializeDefaultAgents(): Promise<void> {
  const agents = [
    {
      name: "Market Intelligence Agent",
      type: "MARKET",
      description: "Analyzes marketplace trends and optimizes listings",
      systemPrompt:
        "You are an expert marketplace analyst. Analyze market data, provide pricing recommendations, and optimize product listings.",
    },
    {
      name: "Analytics & Reporting Agent",
      type: "ANALYTICS",
      description: "Generates insights and analytics reports",
      systemPrompt:
        "You are a data analyst. Create comprehensive reports, identify patterns, and provide actionable insights.",
    },
    {
      name: "Content Generation Agent",
      type: "CONTENT",
      description: "Creates and curates marketing content",
      systemPrompt:
        "You are a content strategist. Generate compelling marketing copy, social posts, and product descriptions.",
    },
    {
      name: "Task Scheduler Agent",
      type: "SCHEDULER",
      description: "Manages scheduled tasks and automation",
      systemPrompt:
        "You are a task coordinator. Schedule operations, manage workflows, and automate repetitive tasks.",
    },
    {
      name: "System Administrator Agent",
      type: "ADMIN",
      description: "Monitors system health and performs maintenance",
      systemPrompt:
        "You are a system administrator. Monitor infrastructure, manage resources, and handle maintenance operations.",
    },
  ];

  for (const agentConfig of agents) {
    const existing = await db.agent.findFirst({
      where: { type: agentConfig.type },
    });

    if (!existing) {
      await db.agent.create({
        data: {
          name: agentConfig.name,
          type: agentConfig.type,
          description: agentConfig.description,
          version: "1.0.0",
          systemPrompt: agentConfig.systemPrompt,
          model: "gemini-2.0-flash",
          temperature: 0.7,
          maxTokens: 2000,
          capabilities: JSON.stringify([
            "autonomous-execution",
            "tool-calling",
            "report-generation",
          ]),
          toolsEnabled: JSON.stringify(["all"]),
          status: "ACTIVE",
          isAutonomous: true,
          requiresApproval: false,
          maxRetries: 3,
          retryDelayMs: 1000,
          timeoutMs: 30000,
          concurrencyLimit: 5,
        },
      });

      console.log(`      • Created ${agentConfig.type} agent`);
    }
  }
}

export default initializeAgentSystem;
