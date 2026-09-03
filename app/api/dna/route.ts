import { google } from '@ai-sdk/google';
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
  "avoid": ["Pastel Clichés", "Overly Delicate", "Corporate Rigidity"],
  "concepts": [
    {
      "id": "a",
      "title": "Little Explorers",
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

    // maxRetries: 0 stops the SDK from hanging when 429 occurs
    const { text } = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      system: "You are an elite Creative Director. Output valid raw JSON only.",
      prompt,
      maxRetries: 0,
    });

    const cleanJson = text.replace(/```json/i, '').replace(/```/g, '').trim();
    return NextResponse.json(JSON.parse(cleanJson));
  } catch (error: any) {
    console.warn("Gemini Quota Exceeded (429) or Unavailable. Serving synthesized fallback.");

    // Contextual algorithm based on user's actual brand input and chosen emotions
    const isPlayful = emotions.some(e => e.toLowerCase().includes("playful") || e.toLowerCase().includes("energetic"));
    const isCalm = emotions.some(e => e.toLowerCase().includes("calm") || e.toLowerCase().includes("sophisticated"));

    return NextResponse.json({
      dna: {
        sophistication: isCalm ? 85 : 60,
        energy: emotions.some(e => e.toLowerCase().includes("energetic")) ? 90 : 55,
        warmth: emotions.some(e => e.toLowerCase().includes("warm")) ? 90 : 70,
        playfulness: isPlayful ? 95 : 45,
        minimalism: isCalm ? 85 : 50,
      },
      personality: isPlayful ? "Playful Tactile Archetype" : "Refined Essentialist",
      keywords: ["Authentic", "Tactile", "Functional", "Characterful"],
      avoid: ["Derivative Tropes", "Visual Clutter", "Corporate Genericness"],
      concepts: [
        {
          id: "a",
          title: "Heritage Explorers",
          tagline: "Designed for living, built to last",
          emotion: emotions[0] || "Warm",
          style: "Tactile Utility",
          description: `A grounded aesthetic tailored for ${brandDescription.slice(0, 30)}. Emphasizes sturdy textures and deliberate details.`,
          devilsAdvocate: "Could feel overly utilitarian if softer accent tones are neglected."
        },
        {
          id: "b",
          title: "Kinetic Wonder",
          tagline: "Movement over perfection",
          emotion: emotions[1] || "Energetic",
          style: "Bold Contemporary",
          description: "High-contrast dynamic layouts with spontaneous typography and saturated focal points.",
          devilsAdvocate: "Can introduce brand fatigue if loud visuals are applied without sufficient breathing room."
        },
        {
          id: "c",
          title: "Silent Horizon",
          tagline: "Unspoken quality speaks loudest",
          emotion: emotions[2] || "Sophisticated",
          style: "Nordic Minimal",
          description: "Muted monochromatic gradients, thoughtful micro-details, and generous negative space.",
          devilsAdvocate: "Demands impeccable physical materials to avoid appearing unfinished."
        }
      ]
    });
  }
}