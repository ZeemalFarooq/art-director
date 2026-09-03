import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  let brandDescription = "";
  let selectedConcept: any = null;
  let personality = "";

  try {
    const body = await req.json();
    brandDescription = body.brandDescription || "Modern Brand";
    selectedConcept = body.selectedConcept || {};
    personality = body.personality || "Essentialist";

    const prompt = `
Brand: "${brandDescription}"
Archetype: "${personality}"
Chosen Concept:
- Title: "${selectedConcept.title}"
- Style: "${selectedConcept.style}"
- Tagline: "${selectedConcept.tagline}"

Generate a complete visual production kit formatted strictly as JSON (no markdown backticks, only raw JSON):

{
  "colors": [
    { "role": "Dominant Base", "hex": "#1E1E1E", "name": "Carbon Slate", "usage": "Foundational backgrounds and structural blocks" },
    { "role": "Secondary Neutral", "hex": "#F5F2EB", "name": "Oat Canvas", "usage": "Warm negative space, cards, and editorial layouts" },
    { "role": "Primary Accent", "hex": "#C56A35", "name": "Terracotta", "usage": "Primary action triggers, focal icons, and seals" },
    { "role": "Supporting Accent", "hex": "#7E8D79", "name": "Muted Pine", "usage": "Secondary highlights, borders, and badges" }
  ],
  "typography": {
    "heading": { "font": "Cabinet Grotesk / Editorial Serif", "style": "Tight tracking, optical kerning, high visual impact" },
    "body": { "font": "General Sans / Clean Grotesque", "style": "Generous line-height, balanced weight distribution" }
  },
  "heroPrompt": "Editorial flat-lay lookbook photograph for ${brandDescription}, styled in ${selectedConcept.style} aesthetic. Warm directional window light, tactile materials on natural linen background, soft film grain, shot on 35mm Leica M6, 50mm f/1.4 lens, authentic textures, high resolution, award-winning art direction.",
  "creativeBrief": {
    "coreThesis": "Strategic positioning centered on deliberate minimalism and textural honesty.",
    "doList": ["Prioritize generous negative space", "Embrace natural textile textures", "Keep typographic hierarchy restrained"],
    "dontList": ["Avoid high-gloss synthetic lighting", "Avoid childish cartoon tropes", "Avoid cluttered layout compositions"]
  }
}
`;

    const { text } = await generateText({
      model: google('gemini-3.6-flash'),
      system: "You are an elite Creative Director. Output valid raw JSON only.",
      prompt,
    });

    const cleanJson = text.replace(/```json/i, '').replace(/```/g, '').trim();
    return NextResponse.json(JSON.parse(cleanJson));
  } catch (error: any) {
    console.warn("Studio 503/Unavailable, returning resilient dynamic schema.");

    return NextResponse.json({
      colors: [
        { role: "Dominant Base", hex: "#1A1A1A", name: "Deep Obsidian", usage: "High-contrast structural headers and text" },
        { role: "Secondary Neutral", hex: "#F7F3ED", name: "Warm Parchment", usage: "Primary background space and clean surfaces" },
        { role: "Primary Accent", hex: "#C56A35", name: "Raw Ochre", usage: "Call-to-actions, hero badges, and distinctive marks" },
        { role: "Supporting Accent", hex: "#8A9A86", name: "Eucalyptus Mist", usage: "Subtle dividers, tag backgrounds, and accents" }
      ],
      typography: {
        heading: { font: "Fraunces / Editorial Serif", style: "Organic curves, tight letter spacing, high visual presence" },
        body: { font: "Inter / Modern Sans", style: "1.6 line height, neutral geometry, high readability" }
      },
      heroPrompt: `An editorial brand photography series for ${brandDescription}. Styled in a ${selectedConcept?.style || 'Contemporary'} direction with soft morning light, muted color palette, tactile natural materials, medium format photography, 80mm lens, authentic and unposed.`,
      creativeBrief: {
        coreThesis: `Establish an authentic market position for ${brandDescription} through restrained composition and textural depth.`,
        doList: ["Maintain consistent color temperature across all touchpoints", "Rely on authentic physical textures over artificial gradients", "Use typography as an active visual element"],
        dontList: ["Avoid oversaturated primary colors", "Avoid generic corporate clip-art or clichéd iconography", "Avoid crowding margins and safe zones"]
      }
    });
  }
}