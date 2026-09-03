import { groq } from '@ai-sdk/groq';
import { generateText } from 'ai';
import { NextResponse } from 'next/server';
import { fetchHuemintPalette } from '@/lib/huemint';
import { getCuratedFontPairing } from '@/lib/fontEngine';

export async function POST(req: Request) {
  try {
    const { brandDescription, selectedConcept, personality } = await req.json();

    // 1. Generate deep-learning palette via Huemint API
    const huemintHexes = await fetchHuemintPalette(1.4);

    // 2. Derive typographic vector anchors from Fontjoy engine
    const initialPairing = getCuratedFontPairing(personality || selectedConcept?.style);

    const prompt = `
Project Subject: "${brandDescription}"
Concept Direction: "${selectedConcept?.title || 'Bespoke'}" (${selectedConcept?.style || 'Contemporary'})
Brand Personality: "${personality || 'Dynamic'}"
${huemintHexes ? `AI Generated Hex Spectrum: ${JSON.stringify(huemintHexes)}` : ''}
Font Anchors: Heading "${initialPairing.heading.font}", Body "${initialPairing.body.font}"

You are an elite Type & Art Director.
Generate a cohesive visual design kit strictly customized to "${brandDescription}".
1. Color System: Map the hexes (or generate 4 distinct hexes) into functional roles (Dominant Base, Secondary Neutral, Primary Accent, Supporting Accent) with expressive names and usage details.
2. Typography: Curate authentic display headline and readable body Google Fonts matching the concept.
3. Hero Prompt: Write a 25-word commercial product/lookbook photography prompt focusing on tangible objects from "${brandDescription}". Avoid empty spaces or abstract canvases.

Output ONLY valid raw JSON with this exact schema (no markdown fences):
{
  "colors": [
    { "role": "Dominant Base", "hex": "#HEX", "name": "Name", "usage": "Specific application" },
    { "role": "Secondary Neutral", "hex": "#HEX", "name": "Name", "usage": "Specific application" },
    { "role": "Primary Accent", "hex": "#HEX", "name": "Name", "usage": "Specific application" },
    { "role": "Supporting Accent", "hex": "#HEX", "name": "Name", "usage": "Specific application" }
  ],
  "typography": {
    "heading": { "font": "${initialPairing.heading.font}", "style": "${initialPairing.heading.style}" },
    "body": { "font": "${initialPairing.body.font}", "style": "${initialPairing.body.style}" }
  },
  "heroPrompt": "commercial editorial product photograph of [tangible subject from ${brandDescription}], styled in ${selectedConcept?.style}, studio lighting, 8k resolution, photorealistic",
  "creativeBrief": {
    "coreThesis": "Strategic brand thesis statement",
    "doList": ["Direct guideline 1", "Direct guideline 2", "Direct guideline 3"],
    "dontList": ["Avoid rule 1", "Avoid rule 2", "Avoid rule 3"]
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
    console.error("Studio error:", error);
    return NextResponse.json({ error: error?.message || "Failed to generate studio assets" }, { status: 500 });
  }
}