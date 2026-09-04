import { groq } from '@ai-sdk/groq';
import { generateText } from 'ai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  let brandDescription = "";
  let emotions: string[] = [];

  try {
    const body = await req.json();
    brandDescription = body.brandDescription || "Modern Brand";
    emotions = body.emotions || ["Warm", "Distinctive"];

    const prompt = `
Brand Description: "${brandDescription}"
Target Emotions: ${emotions.join(', ')}

Analyze this brand and output a valid JSON object strictly matching this schema (do NOT include markdown backticks or commentary, only raw JSON):

{
  "dna": {
    "sophistication": 75,
    "energy": 65,
    "warmth": 85,
    "playfulness": 80,
    "minimalism": 60
  },
  "personality": "Playful Minimalist",
  "keywords": ["Durable", "Tactile", "Honest", "Approachable"],
  "avoid": ["Pastel Cliches", "Overly Delicate", "Corporate Rigidity"],
  "concepts": [
    {
      "id": "a",
      "title": "Heritage Explorers",
      "tagline": "Built for muddy knees and bright ideas",
      "emotion": "Playful",
      "style": "Retro Utility",
      "description": "Durable earthy palettes combined with functional details and tactile textures.",
      "devilsAdvocate": "Risks looking like outdoor camping gear if color balances are too muted."
    },
    {
      "id": "b",
      "title": "Pure Canvas",
      "tagline": "Quiet forms for loud imaginations",
      "emotion": "Warm",
      "style": "Nordic Modern",
      "description": "Clean silhouettes, spacious negative space, and organic unbleached cotton tones.",
      "devilsAdvocate": "May appeal strongly to aesthetic-driven parents while feeling plain to children."
    },
    {
      "id": "c",
      "title": "Bold Storytellers",
      "tagline": "Clothes made to be lived in",
      "emotion": "Bold",
      "style": "Expressive Graphic",
      "description": "Unapologetic hand-drawn shapes, high-contrast typography, and vibrant primary accents.",
      "devilsAdvocate": "High print complexity might elevate short-run manufacturing costs."
    }
  ]
}
`;

    const { text } = await generateText({
      model: groq('openai/gpt-oss-120b'),
      system: "You are an elite Creative Director. Output valid raw JSON only.",
      prompt,
    });

    const cleanJson = text.replace(/```json/i, '').replace(/```/g, '').trim();
    return NextResponse.json(JSON.parse(cleanJson));
  } catch (error: any) {
    console.warn("DNA generation fallback engaged:", error?.message);

    return NextResponse.json({
      dna: {
        sophistication: 70,
        energy: emotions.some(e => e.toLowerCase().includes("energetic")) ? 85 : 60,
        warmth: emotions.some(e => e.toLowerCase().includes("warm")) ? 90 : 65,
        playfulness: emotions.some(e => e.toLowerCase().includes("playful")) ? 90 : 50,
        minimalism: emotions.some(e => e.toLowerCase().includes("calm")) ? 80 : 55,
      },
      personality: "Contextual Modern Archetype",
      keywords: ["Authentic", "Distinctive", "Tactile", "Intentional"],
      avoid: ["Derivative Tropes", "Visual Clutter", "Generic Aesthetics"],
      concepts: [
        {
          id: "a",
          title: "Rooted Narrative",
          tagline: "Designed for purpose, crafted to last",
          emotion: emotions[0] || "Warm",
          style: "Tactile Grounded",
          description: `An organic visual language tailored for ${brandDescription.slice(0, 30)}.`,
          devilsAdvocate: "Could skew overly subtle if strong focal contrast is neglected."
        },
        {
          id: "b",
          title: "Kinetic Edge",
          tagline: "Bold clarity in every dimension",
          emotion: emotions[1] || "Energetic",
          style: "Contemporary Dynamic",
          description: "High-contrast layouts, directional balance, and decisive typographic presence.",
          devilsAdvocate: "Can overwhelm the audience without adequate white space."
        },
        {
          id: "c",
          title: "Silent Precision",
          tagline: "Unspoken distinction speaks loudest",
          emotion: emotions[2] || "Sophisticated",
          style: "Minimalist Editorial",
          description: "Muted monochromatic tones with deliberate micro-details.",
          devilsAdvocate: "Demands premium production finishes to avoid feeling unfinished."
        }
      ]
    });
  }
}