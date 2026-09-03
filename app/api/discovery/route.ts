import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { NextResponse } from 'next/server';

interface DiscoveryOption {
  id: unknown;
  label: unknown;
}

const groq = createOpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY || '',
});

export async function POST(req: Request) {
  try {
    const { userMessage } = await req.json();

    const { text } = await generateText({
     model: groq('openai/gpt-oss-120b'),
      system: `You are an elite AI Art Director and brand strategist. 
      Analyze the user's brand description with a sharp, creative perspective. 
      Give a concise 1-2 sentence response validating and shaping their vision. Then create exactly 6
      emotionally precise, brand-specific aesthetic directions for the user to choose from. Avoid generic
      defaults when the prompt suggests a more distinctive feeling. Return raw JSON only, matching this schema:
      {
        "reply": "your concise response ending with a selection prompt",
        "options": [{ "id": "short-slug", "label": "2-4 word emotional direction" }]
      }
      The reply must end by asking: "Which emotional directions should define this identity? (Select up to 3)"
      Keep the tone premium, confident, concise, and editorial.`,
      prompt: userMessage,
    });

    const cleanJson = text.replace(/```json/i, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);
    const options = Array.isArray(parsed.options)
      ? parsed.options
        .filter((option: DiscoveryOption) => option.id && option.label)
        .slice(0, 6)
        .map((option: DiscoveryOption) => ({ id: String(option.id), label: String(option.label) }))
      : [];

    if (options.length < 3 || typeof parsed.reply !== 'string') throw new Error('Invalid discovery shape');
    return NextResponse.json({ reply: parsed.reply, options });
  } catch {
    return NextResponse.json({
      reply: `That offers a compelling creative territory. To craft a distinct visual language, we must balance functionality with unmistakable character. Which emotional directions should define this identity? (Select up to 3)`,
      options: [
        { id: "quiet-confidence", label: "Quiet Confidence" },
        { id: "tactile-warmth", label: "Tactile Warmth" },
        { id: "restless-curiosity", label: "Restless Curiosity" },
        { id: "radical-clarity", label: "Radical Clarity" },
        { id: "human-optimism", label: "Human Optimism" },
        { id: "cultured-edge", label: "Cultured Edge" },
      ]
    });
  }
}