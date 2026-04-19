import { NextRequest, NextResponse } from "next/server";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { checkElevenLabsKey } from "@/lib/ai/key-check";

let _elevenlabs: ElevenLabsClient | null = null;
function getElevenLabsClient() {
  if (!_elevenlabs) {
    _elevenlabs = new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY,
    });
  }
  return _elevenlabs;
}

export async function POST(request: NextRequest) {
  const keyStatus = checkElevenLabsKey();
  if (!keyStatus.ok) {
    console.error("[aero/transcribe] ElevenLabs key missing:", keyStatus.reason);
    return NextResponse.json({ error: `ElevenLabs unavailable: ${keyStatus.reason}` }, { status: 503 });
  }

  try {
    const formData = await request.formData();
    const audio = formData.get("audio") as File;

    if (!audio) {
      return NextResponse.json({ error: "No audio file" }, { status: 400 });
    }

    const result = await getElevenLabsClient().speechToText.convert({
      file: audio,
      modelId: "scribe_v1",
    });

    return NextResponse.json({ text: result.text });
  } catch (error) {
    console.error("Transcribe error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Transcription failed" },
      { status: 500 }
    );
  }
}
