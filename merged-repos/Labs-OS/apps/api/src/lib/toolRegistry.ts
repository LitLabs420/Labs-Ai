import { PrismaClient } from "@prisma/client";

export interface ToolParameter {
  name: string;
  type: string;
  description: string;
  required: boolean;
  enum?: string[];
  default?: unknown;
}

export interface Tool {
  name: string;
  version: string;
  description: string;
  parameters: ToolParameter[];
  category: string;
  validate?: (args: Record<string, unknown>) => { valid: boolean; error?: string };
  execute: (args: Record<string, unknown>) => Promise<unknown>;
}

class ToolRegistry {
  private tools: Map<string, Tool> = new Map();
  private db: PrismaClient;

  constructor(db: PrismaClient) {
    this.db = db;
  }

  public registerTool(tool: Tool): void {
    this.tools.set(tool.name, tool);
    console.log(`[ToolRegistry] Registered tool: ${tool.name}`);
  }

  public getTool(name: string): Tool | undefined {
    return this.tools.get(name);
  }

  public listTools(category?: string): Tool[] {
    const tools = Array.from(this.tools.values());
    return category ? tools.filter((t) => t.category === category) : tools;
  }

  public getToolsForAgent(agentType: string): Tool[] {
    const categoryMap: { [key: string]: string[] } = {
      "MARKET": ["market", "analytics"],
      "ANALYTICS": ["analytics", "market"],
      "CONTENT": ["content", "market"],
      "SCHEDULER": ["scheduling", "system"],
      "ADMIN": ["system", "analytics"],
    };

    const categories = categoryMap[agentType] ?? ["system"];
    const agentTools: Tool[] = [];

    for (const category of categories) {
      agentTools.push(...this.listTools(category));
    }

    return agentTools;
  }
}

let registryInstance: ToolRegistry | null = null;

export function initializeToolRegistry(db: PrismaClient): ToolRegistry {
  registryInstance = new ToolRegistry(db);

  // Market Tools
  registryInstance.registerTool({
    name: "get_listings",
    version: "1.0",
    description: "Retrieve active marketplace listings",
    category: "market",
    parameters: [
      {
        name: "filters",
        type: "object",
        description: "Search filters",
        required: false,
      },
      {
        name: "limit",
        type: "number",
        description: "Max results",
        required: false,
        default: 50,
      },
    ],
    execute: async () => {
      return { listings: [], total: 0 };
    },
  });

  registryInstance.registerTool({
    name: "analyze_market_price",
    version: "1.0",
    description: "Analyze market trends",
    category: "market",
    parameters: [
      {
        name: "category",
        type: "string",
        description: "Product category",
        required: true,
      },
    ],
    execute: async () => {
      return { trendDirection: "up", avgPrice: 0 };
    },
  });

  registryInstance.registerTool({
    name: "create_listing",
    version: "1.0",
    description: "Create marketplace listing",
    category: "market",
    parameters: [
      {
        name: "title",
        type: "string",
        description: "Listing title",
        required: true,
      },
      {
        name: "price",
        type: "number",
        description: "Price in USD",
        required: true,
      },
    ],
    execute: async () => {
      return { listingId: "new-id", createdAt: new Date() };
    },
  });

  // Analytics Tools
  registryInstance.registerTool({
    name: "get_user_metrics",
    version: "1.0",
    description: "Get user activity metrics",
    category: "analytics",
    parameters: [
      {
        name: "userId",
        type: "string",
        description: "User ID",
        required: true,
      },
    ],
    execute: async () => {
      return { activeRate: 0, engagementScore: 0 };
    },
  });

  registryInstance.registerTool({
    name: "generate_report",
    version: "1.0",
    description: "Generate analytics report",
    category: "analytics",
    parameters: [
      {
        name: "reportType",
        type: "string",
        description: "Report type",
        required: true,
        enum: ["user", "market", "sales"],
      },
    ],
    execute: async () => {
      return { reportId: "report-123", generatedAt: new Date() };
    },
  });

  // Content Tools
  registryInstance.registerTool({
    name: "generate_content",
    version: "1.0",
    description: "Generate marketing content",
    category: "content",
    parameters: [
      {
        name: "contentType",
        type: "string",
        description: "Content type",
        required: true,
        enum: ["title", "description", "social_post", "email"],
      },
      {
        name: "topic",
        type: "string",
        description: "Content topic",
        required: true,
      },
    ],
    execute: async () => {
      return { content: "", tokenUsage: { input: 0, output: 0 } };
    },
  });

  registryInstance.registerTool({
    name: "curate_content",
    version: "1.0",
    description: "Curate content collection",
    category: "content",
    parameters: [
      {
        name: "contentIds",
        type: "array",
        description: "Content IDs",
        required: true,
      },
    ],
    execute: async () => {
      return { collectionId: "coll-123" };
    },
  });

  // Scheduling Tools
  registryInstance.registerTool({
    name: "schedule_task",
    version: "1.0",
    description: "Schedule task execution",
    category: "scheduling",
    parameters: [
      {
        name: "taskName",
        type: "string",
        description: "Task identifier",
        required: true,
      },
      {
        name: "schedule",
        type: "string",
        description: "Cron expression",
        required: true,
      },
    ],
    execute: async () => {
      return { scheduleId: "sched-123", nextRun: new Date() };
    },
  });

  // System Tools
  registryInstance.registerTool({
    name: "get_system_health",
    version: "1.0",
    description: "Check system health",
    category: "system",
    parameters: [],
    execute: async () => {
      return {
        status: "healthy",
        uptime: process.uptime(),
        timestamp: new Date(),
      };
    },
  });

  registryInstance.registerTool({
    name: "send_notification",
    version: "1.0",
    description: "Send user notification",
    category: "system",
    parameters: [
      {
        name: "userId",
        type: "string",
        description: "User ID",
        required: true,
      },
      {
        name: "message",
        type: "string",
        description: "Notification message",
        required: true,
      },
    ],
    execute: async () => {
      return { notificationId: "notif-123", sent: true };
    },
  });

  console.log(`[ToolRegistry] Initialization complete`);
  return registryInstance;
}

export function getToolRegistry(): ToolRegistry {
  if (!registryInstance) {
    throw new Error("Tool registry not initialized");
  }
  return registryInstance;
}
