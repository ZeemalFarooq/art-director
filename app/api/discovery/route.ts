import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userMessage } = body;

    if (!userMessage) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Keep gemini-3.6-flash
    const { text } = await generateText({
      model: google('gemini-3.6-flash'),
      system: `You are an expert AI Art Director and brand strategist. 
      Your goal is to help a user define their brand's visual identity.
      The user will describe their brand or project. 
      Analyze their description with a sharp, creative perspective, give a 1-2 sentence response validating and shaping their vision, and conclude by asking:
      "What are the primary emotions people should feel when they interact with this brand? (Select up to 3)"
      Keep your tone premium, confident, concise, and editorial.`,
      prompt: userMessage,
    });

    return NextResponse.json({ reply: text });
  } catch (error: any) {
    console.error("AI API Error:", error);

    // If Google hits high demand, return a smooth fallback so your project doesn't stall
    if (error?.message?.includes("high demand") || error?.status === 503) {
      return NextResponse.json({
        reply: "That's a compelling brand space. To establish a distinct visual identity, we need to balance functionality with emotional resonance. What are the primary emotions people should feel when they interact with this brand? (Select up to 3)"
      });
    }

    return NextResponse.json(
      { error: error?.message || "Failed to generate AI response" },
      { status: 500 }
    );
  }
}