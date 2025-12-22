import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const db = new PrismaClient();
    const body = await request.json();

    const { type, action, input } = body;

    if (!type || !action) {
      return NextResponse.json(
        { error: "type and action required" },
        { status: 400 }
      );
    }

    // Create agent task
    const agent = await db.agent.findFirst({
      where: { type, status: "ACTIVE" },
    });

    if (!agent) {
      return NextResponse.json({ error: "No agent found" }, { status: 404 });
    }

    const task = await db.agentTask.create({
      data: {
        agentId: agent.id,
        title: action,
        description: JSON.stringify(input),
        input: JSON.stringify(input),
        trigger: "MANUAL",
        priority: 5,
        status: "PENDING",
      },
    });

    // Create execution
    const execution = await db.agentExecution.create({
      data: {
        agentId: agent.id,
        taskId: task.id,
        input: JSON.stringify(input),
        systemPromptUsed: agent.systemPrompt,
        modelUsed: agent.model,
        status: "RUNNING",
        startedAt: new Date(),
      },
    });

    // TODO: Queue task for background processing via NATS

    return NextResponse.json({
      executionId: execution.id,
      taskId: task.id,
      status: "queued",
    });
  } catch (error) {
    console.error("Agent execution error:", error);
    return NextResponse.json(
      { error: "Execution failed" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const db = new PrismaClient();
    const agentType = request.nextUrl.searchParams.get("type");

    const agents = await db.agent.findMany({
      where: agentType ? { type: agentType } : undefined,
      select: {
        id: true,
        name: true,
        type: true,
        status: true,
        totalExecutions: true,
        successCount: true,
        failureCount: true,
        averageLatencyMs: true,
      },
    });

    return NextResponse.json({ agents });
  } catch (error) {
    console.error("Agent list error:", error);
    return NextResponse.json(
      { error: "Failed to list agents" },
      { status: 500 }
    );
  }
}
