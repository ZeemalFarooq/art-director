import { groq } from '@ai-sdk/groq';
import { generateText } from 'ai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { brandDescription, selectedConcept, personality } = await req.json();

    const prompt = `
You are a world-class Art Director and Creative Technologist.
Analyze this brand/product: "${brandDescription}"
Concept Trajectory: "${selectedConcept?.title || 'Bespoke'}" (${selectedConcept?.style || 'Editorial'})
Archetype: "${personality || 'Dynamic'}"

Your objective: Engineer an uncompromising visual design kit specifically for "${brandDescription}".
DO NOT rely on generic defaults or presets. Derive colors, typography, and visuals organically from the physical materials, cultural cues, and industry standards of this exact subject.

Rules:
1. Palette Requirements:
   - "Dominant Base": Must be a high-contrast foundation (#080808 to #242424 for dark palettes, or deep ink/slate).
   - "Secondary Neutral": Must provide clean negative space (#FFFFFF, #F8F7F4, or deep matte tint if dark-mode).
   - "Primary Accent": The unmistakable hero color signature (e.g. vibrant citrus for beverage, brushed bronze for architecture, neon cyan for gaming).
   - "Supporting Accent": A harmonious bridge tone for borders, micro-tags, and secondary highlights.
2. Typography: Pair genuine, distinct typefaces fitting the industry (e.g., razor-sharp grotesque for tech, high-contrast serif for luxury/editorial, friendly rounded sans for modern consumer goods).
3. Hero Prompt: A concrete, 25-word photorealistic commercial product/scene photograph showcasing real items native to "${brandDescription}". Focus on tangible textures, professional studio lighting, and high-end staging.

Output strictly valid JSON (no markdown wrappers):
{
  "colors": [
    { "role": "Dominant Base", "hex": "#HEX", "name": "Creative Name", "usage": "Specific brand application" },
    { "role": "Secondary Neutral", "hex": "#HEX", "name": "Creative Name", "usage": "Specific brand application" },
    { "role": "Primary Accent", "hex": "#HEX", "name": "Creative Name", "usage": "Specific brand application" },
    { "role": "Supporting Accent", "hex": "#HEX", "name": "Creative Name", "usage": "Specific brand application" }
  ],
  "typography": {
    "heading": { "font": "Typeface Name", "style": "Weight, tracking, and optical presence" },
    "body": { "font": "Typeface Name", "style": "Weight, aperture, and legibility notes" }
  },
  "heroPrompt": "commercial editorial product photograph of [tangible subject from ${brandDescription}], professional lighting, 8k resolution, photorealistic",
  "creativeBrief": {
    "coreThesis": "1 concise sentence defining brand positioning",
    "doList": ["Design rule 1", "Design rule 2", "Design rule 3"],
    "dontList": ["Industry visual cliché to avoid 1", "Cliché 2", "Cliché 3"]
  }
}
`;

    const { text } = await generateText({
      model: groq('openai/gpt-oss-120b'),
      temperature: 0.8,
      prompt,
    });

    const cleanJson = text.replace(/```json/i, '').replace(/```/g, '').trim();
    return NextResponse.json(JSON.parse(cleanJson));
  } catch (error: any) {
    console.error("Studio error:", error);
    return NextResponse.json({ error: error?.message || "Failed to generate studio assets" }, { status: 500 });
  }
}