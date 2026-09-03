import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { NextResponse } from 'next/server';

const groq = createOpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY || '',
});

export async function POST(req: Request) {
  let brandDescription = "";
  let selectedConcept: any = null;
  let personality = "";

  try {
    const body = await req.json();
    brandDescription = body.brandDescription || "University orientation event";
    selectedConcept = body.selectedConcept || { title: "Nexus Horizon", style: "Vibrant Academic", tagline: "Ignite the future" };
    personality = body.personality || "Academic Dynamic";

    const prompt = `
Brand / Project: "${brandDescription}"
Concept Title: "${selectedConcept.title}"
Aesthetic Style: "${selectedConcept.style}"

You are a legendary Art Director. Design a tailored color palette and typography specifically for this exact topic (e.g. if university orientation, use academic colors like collegiate navy, electric ochre; if kids clothing, use soft organic pastels or earthy tones). NEVER repeat generic palettes.

Output ONLY valid JSON strictly matching:
{
  "colors": [
    { "role": "Dominant Base", "hex": "#HEX", "name": "Name", "usage": "Usage details" },
    { "role": "Secondary Neutral", "hex": "#HEX", "name": "Name", "usage": "Usage details" },
    { "role": "Primary Accent", "hex": "#HEX", "name": "Name", "usage": "Usage details" },
    { "role": "Supporting Accent", "hex": "#HEX", "name": "Name", "usage": "Usage details" }
  ],
  "typography": {
    "heading": { "font": "Specific Heading Font", "style": "Typographic description" },
    "body": { "font": "Specific Body Font", "style": "Description" }
  },
  "heroPrompt": "Concise photo subject: ${brandDescription}, aesthetic: ${selectedConcept.style}, studio lighting, realistic, 35mm photography, high resolution",
  "creativeBrief": {
    "coreThesis": "1 concise sentence thesis",
    "doList": ["Rule 1", "Rule 2", "Rule 3"],
    "dontList": ["Avoid 1", "Avoid 2", "Avoid 3"]
  }
}
`;

    const { text } = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      prompt,
    });

    const cleanJson = text.replace(/```json/i, '').replace(/```/g, '').trim();
    return NextResponse.json(JSON.parse(cleanJson));
  } catch (error: any) {
    console.warn("Generating dynamic context-aware palette fallback:", error?.message);

    // DYNAMIC FALLBACK based on what the user typed:
    const isAcademic = brandDescription.toLowerCase().includes("university") || brandDescription.toLowerCase().includes("school") || brandDescription.toLowerCase().includes("orientation");
    const isKids = brandDescription.toLowerCase().includes("kid") || brandDescription.toLowerCase().includes("cloth");

    if (isAcademic) {
      return NextResponse.json({
        colors: [
          { role: "Dominant Base", hex: "#0F1E36", name: "Collegiate Navy", usage: "Official architectural structures, formal typography" },
          { role: "Secondary Neutral", hex: "#F5F6F8", name: "Campus Stone", usage: "Clean backdrops, program guides, badges" },
          { role: "Primary Accent", hex: "#E65100", name: "Solar Amber", usage: "Orientation banners, call to action, student wristbands" },
          { role: "Supporting Accent", hex: "#00897B", name: "Campus Pine", usage: "Wayfinding accents and interactive zones" }
        ],
        typography: {
          heading: { font: "Clash Display / Sharp Sans", style: "High impact, wide stance, collegiate energy" },
          body: { font: "Plus Jakarta Sans", style: "Ultra-readable modern sans for mobile schedules" }
        },
        heroPrompt: "A dynamic university orientation welcome courtyard, university banners, youthful diverse students, golden hour sunlight, architectural campus background, candid documentary photography, Sony A7IV",
        creativeBrief: {
          coreThesis: "Fostering immediate belonging and momentum through bold navigational design.",
          doList: ["Use bold directional color-coding", "Emphasize candid student imagery", "Keep event timetables legible"],
          dontList: ["Avoid dull bureaucratic corporate tones", "Avoid tiny unreadable schedules", "Avoid generic stock classroom poses"]
        }
      });
    }

    if (isKids) {
      return NextResponse.json({
        colors: [
          { role: "Dominant Base", hex: "#2E382E", name: "Forest Moss", usage: "Durable structural typography and badges" },
          { role: "Secondary Neutral", hex: "#F8F5EE", name: "Unbleached Cotton", usage: "Negative space, hang tags, natural backgrounds" },
          { role: "Primary Accent", hex: "#E07A5F", name: "Terracotta Clay", usage: "Playful pocket stitching, logo mark" },
          { role: "Supporting Accent", hex: "#81B29A", name: "Meadow Sage", usage: "Soft trim, organic pattern highlights" }
        ],
        typography: {
          heading: { font: "Recoleta / Warm Soft Serif", style: "Plump friendly curves, organic character" },
          body: { font: "Satoshi / Rounded Geometric", style: "Gentle, accessible, clean readability" }
        },
        heroPrompt: "Flat lay studio photograph of organic children clothing set on a textured wooden surface, morning daylight, neutral earthy tones, tactile linen textile, 50mm lens",
        creativeBrief: {
          coreThesis: "Celebrating childhood curiosity through sustainable, tactile garments.",
          doList: ["Showcase textile textures up close", "Use earthy natural dyes", "Keep silhouette lines unrestrictive"],
          dontList: ["Avoid neon synthetic dyes", "Avoid clichéd cartoon characters", "Avoid plastic packaging"]
        }
      });
    }

    // Default unique dynamic palette
    return NextResponse.json({
      colors: [
        { role: "Dominant Base", hex: "#18181B", name: "Carbon Ink", usage: "Primary headlines and structural framing" },
        { role: "Secondary Neutral", hex: "#FAFAF9", name: "Warm Off-White", usage: "Editorial spacious background surfaces" },
        { role: "Primary Accent", hex: "#2563EB", name: "Electric Cobalt", usage: "Primary visual focal points and hero moments" },
        { role: "Supporting Accent", hex: "#F59E0B", name: "Amber Glow", usage: "Micro badges, status highlights" }
      ],
      typography: {
        heading: { font: "Cabinet Grotesk", style: "Bold optical weight, confident presence" },
        body: { font: "General Sans", style: "Clear neutral interface typography" }
      },
      heroPrompt: `Editorial lookbook photograph of ${brandDescription}, minimalist studio setting, soft cinematic lighting, 35mm film photography, 8k resolution`,
      creativeBrief: {
        coreThesis: `Establish a distinct visual market presence for ${brandDescription}.`,
        doList: ["Prioritize intentional negative space", "Rely on distinct color accents"],
        dontList: ["Avoid generic visual cliches", "Avoid low-contrast typography"]
      }
    });
  }
}