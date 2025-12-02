import { NextRequest, NextResponse } from "next/server";
import { generateDMReply } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const { incomingMessage, userNiche, userContext } = await req.json();

    if (!incomingMessage || !userNiche) {
      return NextResponse.json(
        { error: "Missing required fields: incomingMessage, userNiche" },
        { status: 400 }
      );
    }

    const reply = await generateDMReply(incomingMessage, userNiche, userContext || "");

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("DM reply generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate DM reply" },
      { status: 500 }
    );
  }
}
