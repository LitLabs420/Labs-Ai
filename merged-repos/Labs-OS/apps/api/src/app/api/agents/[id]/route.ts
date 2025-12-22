import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const db = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const execution = await db.agentExecution.findUnique({
      where: { id: params.id },
      include: {
        toolCalls: true,
      },
    });

    if (!execution) {
      return NextResponse.json(
        { error: "Execution not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      executionId: execution.id,
      agentId: execution.agentId,
      status: execution.status,
      startedAt: execution.startedAt,
      completedAt: execution.completedAt,
      durationMs: execution.durationMs,
      output: execution.output ? JSON.parse(execution.output) : null,
      error: execution.error,
      toolCalls: execution.toolCalls.length,
      tokenUsage: {
        input: execution.inputTokens,
        output: execution.outputTokens,
        total: execution.totalTokens,
      },
    });
  } catch (error) {
    console.error("Status error:", error);
    return NextResponse.json(
      { error: "Failed to get status" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const execution = await db.agentExecution.findUnique({
      where: { id: params.id },
    });

    if (!execution) {
      return NextResponse.json(
        { error: "Execution not found" },
        { status: 404 }
      );
    }

    if (execution.status !== "RUNNING") {
      return NextResponse.json(
        { error: "Can only cancel running executions" },
        { status: 400 }
      );
    }

    // Update execution status to cancelled
    await db.agentExecution.update({
      where: { id: params.id },
      data: {
        status: "CANCELLED",
        completedAt: new Date(),
      },
    });

    return NextResponse.json({ cancelled: true });
  } catch (error) {
    console.error("Cancel error:", error);
    return NextResponse.json(
      { error: "Failed to cancel" },
      { status: 500 }
    );
  }
}
