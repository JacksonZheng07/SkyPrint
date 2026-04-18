import { NextRequest, NextResponse } from "next/server";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

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
  try {
    const { text } = await request.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Missing text field" },
        { status: 400 }
      );
    }

    const voiceId = process.env.ELEVENLABS_VOICE_ID ?? "21m00Tcm4TlvDq8ikWAM"; // Default: Rachel

    const audioStream = await getElevenLabsClient().textToSpeech.stream(voiceId, {
      text,
      modelId: "eleven_multilingual_v2",
      outputFormat: "mp3_44100_128",
      voiceSettings: {
        stability: 0.65,
        similarityBoost: 0.8,
        style: 0.3,
      },
    });

    return new Response(audioStream as unknown as ReadableStream, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("Aero voice error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Voice generation failed" },
      { status: 500 }
    );
  }
}
