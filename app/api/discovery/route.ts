import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { NextResponse } from 'next/server';

const groq = createOpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY || '',
});

export async function POST(req: Request) {
  try {
    const { userMessage } = await req.json();

    const { text } = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      system: `You are an elite AI Art Director and brand strategist. 
      Analyze the user's brand description with a sharp, creative perspective. 
      Give a concise 1-2 sentence response validating and shaping their vision, then end by asking:
      "What are the primary emotions people should feel when they interact with this brand? (Select up to 3)"
      Keep your tone premium, confident, concise, and editorial.`,
      prompt: userMessage,
    });

    return NextResponse.json({ reply: text });
  } catch (error: any) {
    return NextResponse.json({
      reply: `That offers a compelling creative territory. To craft a distinct visual language, we must balance functionality with unmistakable character. What are the primary emotions people should feel when they interact with this brand? (Select up to 3)`
    });
  }
}