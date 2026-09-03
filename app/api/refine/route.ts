import { groq } from '@ai-sdk/groq';
import { generateText } from 'ai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { userFeedback, brandDescription, currentStudioData, currentConcept } = await req.json();

    const prompt = `
You are an expert Creative Director iterating directly on client feedback.
Project: "${brandDescription}"
Current Direction: "${currentConcept?.title}" (${currentConcept?.style})
Active Colors: ${JSON.stringify(currentStudioData?.colors || [])}
Active Typography: ${JSON.stringify(currentStudioData?.typography || {})}

Client's Requested Adjustment:
"${userFeedback}"

Task:
1. Write a direct, peer-to-peer 1-2 sentence response explaining exactly what you changed based on their note.
2. Re-synthesize the color palette, typography pairing, and image prompt to reflect the critique, while ensuring visual harmony and clear text contrast.

Output strictly valid JSON (no markdown wrappers):
{
  "assistantReply": "<Your direct 1-2 sentence explanation of adjustments made>",
  "updatedStudio": {
    "colors": [
      { "role": "Dominant Base", "hex": "#HEX", "name": "Creative Name", "usage": "Usage detail" },
      { "role": "Secondary Neutral", "hex": "#HEX", "name": "Creative Name", "usage": "Usage detail" },
      { "role": "Primary Accent", "hex": "#HEX", "name": "Creative Name", "usage": "Usage detail" },
      { "role": "Supporting Accent", "hex": "#HEX", "name": "Creative Name", "usage": "Usage detail" }
    ],
    "typography": {
      "heading": { "font": "Typeface Name", "style": "Styling description" },
      "body": { "font": "Typeface Name", "style": "Styling description" }
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
      temperature: 0.7,
      prompt,
    });

    const cleanJson = text.replace(/```json/i, '').replace(/```/g, '').trim();
    return NextResponse.json(JSON.parse(cleanJson));
  } catch (error: any) {
    console.error("Refine API Error:", error);
    return NextResponse.json({ error: error?.message || "Failed to refine studio" }, { status: 500 });
  }
}