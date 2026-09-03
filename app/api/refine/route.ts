import { groq } from '@ai-sdk/groq';
import { generateText } from 'ai';
import { NextResponse } from 'next/server';
import { fetchHuemintPalette } from '@/lib/huemint';

export async function POST(req: Request) {
  try {
    const { userFeedback, brandDescription, currentStudioData, currentConcept } = await req.json();

    // Check if critique touches color
    const isColorFeedback = /color|palette|shade|warm|cold|dark|bright|pastel|hue/i.test(userFeedback);
    let freshHuemintHexes: string[] | null = null;

    if (isColorFeedback) {
      freshHuemintHexes = await fetchHuemintPalette(1.5);
    }

    const prompt = `
You are an expert Creative Director iterating directly on client feedback.
Project: "${brandDescription}"
Current Direction: "${currentConcept?.title}" (${currentConcept?.style})
Active Colors: ${JSON.stringify(currentStudioData?.colors || [])}
Active Typography: ${JSON.stringify(currentStudioData?.typography || {})}
${freshHuemintHexes ? `Fresh AI Color Spectrum: ${JSON.stringify(freshHuemintHexes)}` : ''}

Client's Critique:
"${userFeedback}"

Task:
1. Explain in 1-2 sentences how you adjusted the design system to satisfy their feedback.
2. Provide updated colors, typography pairings, and image prompts reflecting the adjustments.

Output strictly valid JSON (no markdown wrappers):
{
  "assistantReply": "<Your direct 1-2 sentence response explaining updates>",
  "updatedStudio": {
    "colors": [
      { "role": "Dominant Base", "hex": "#HEX", "name": "Name", "usage": "Specific application" },
      { "role": "Secondary Neutral", "hex": "#HEX", "name": "Name", "usage": "Specific application" },
      { "role": "Primary Accent", "hex": "#HEX", "name": "Name", "usage": "Specific application" },
      { "role": "Supporting Accent", "hex": "#HEX", "name": "Name", "usage": "Specific application" }
    ],
    "typography": {
      "heading": { "font": "Specific Typeface", "style": "Weight & tracking notes" },
      "body": { "font": "Specific Typeface", "style": "Weight & line-height notes" }
    },
    "heroPrompt": "commercial editorial product photograph of [refined subject], professional lighting, 8k resolution, photorealistic",
    "creativeBrief": {
      "coreThesis": "<Updated positioning thesis>",
      "doList": ["Guideline 1", "Guideline 2", "Guideline 3"],
      "dontList": ["Avoid 1", "Avoid 2", "Avoid 3"]
    }
  }
}
`;

    const { text } = await generateText({
      model: groq('openai/gpt-oss-120b'),
      temperature: 0.6,
      prompt,
    });

    const cleanJson = text.replace(/```json/i, '').replace(/```/g, '').trim();
    return NextResponse.json(JSON.parse(cleanJson));
  } catch (error: any) {
    console.error("Refine API Error:", error);
    return NextResponse.json({ error: error?.message || "Failed to refine studio" }, { status: 500 });
  }
}