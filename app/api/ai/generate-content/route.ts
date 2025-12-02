import { NextRequest, NextResponse } from "next/server";
import { generateContent } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const { niche, contentType, description, tone } = await req.json();

    // Get auth token from header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate input
    if (!niche || !contentType || !description) {
      return NextResponse.json(
        { error: "Missing required fields: niche, contentType, description" },
        { status: 400 }
      );
    }

    // Generate content using Google Gemini
    const result = await generateContent({
      niche,
      contentType,
      description,
      tone: tone || "casual",
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Content generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate content" },
      { status: 500 }
    );
  }
}
