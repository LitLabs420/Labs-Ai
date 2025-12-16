import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Audio transcription endpoint (OPTIONAL FEATURE)
 * 
 * This endpoint is DISABLED by default and will return 503.
 * 
 * To enable transcription:
 * 1. Install OpenAI SDK: npm install openai@^4.77.0 --legacy-peer-deps
 * 2. Set OPENAI_API_KEY environment variable
 * 3. Uncomment the implementation code below
 * 
 * Note: The openai package has peer dependency conflicts with zod v4.
 * Use --legacy-peer-deps flag when installing.
 */
export async function POST(req: NextRequest) {
  // Return 503 - Feature disabled
  return NextResponse.json(
    { 
      error: "Audio transcription feature is currently disabled.",
      details: "To enable: Install openai package and configure OPENAI_API_KEY"
    },
    { status: 503 },
  );

  /* 
  // UNCOMMENT TO ENABLE TRANSCRIPTION:
  
  // Check if OpenAI is configured
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OpenAI transcription is not configured. Please set OPENAI_API_KEY in environment variables." },
      { status: 503 },
    );
  }

  try {
    // Dynamic import to avoid build errors when openai package is not installed
    const OpenAI = (await import("openai")).default;
    const { toFile } = await import("openai/uploads");

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const upload = await toFile(buffer, file.name || "audio.webm", {
      type: file.type || "audio/webm",
    });

    const transcription = await client.audio.transcriptions.create({
      file: upload,
      model: "whisper-1",
    });

    return NextResponse.json({ text: transcription.text });
  } catch (error: unknown) {
    console.error("Transcription error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    // Check if it's a module not found error
    if (errorMessage.includes("Cannot find module 'openai'")) {
      return NextResponse.json(
        { error: "OpenAI package is not installed. Transcription feature is disabled." },
        { status: 503 },
      );
    }
    
    return NextResponse.json(
      { error: "Unable to transcribe audio right now" },
      { status: 500 },
    );
  }
  */
}
