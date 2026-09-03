import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { brandDescription, emotions } = await req.json();

    const prompt = `
Brand Description: "${brandDescription}"
Target Emotions: ${emotions?.join(', ') || 'Modern, Distinctive'}

Analyze this brand and output a valid JSON object strictly matching this schema (do NOT include markdown backticks or extra text, only raw JSON):

{
  "dna": {
    "sophistication": 75,
    "energy": 60,
    "warmth": 85,
    "playfulness": 90,
    "minimalism": 40
  },
  "personality": "Playful Minimalist",
  "keywords": ["Durable", "Playful", "Honest", "Tactile"],
  "avoid": ["Pastel Clichés", "Overly Delicate", "Corporate Rigidity"],
  "concepts": [
    {
      "id": "a",
      "title": "Little Explorers",
      "tagline": "Built for muddy knees and bright ideas",
      "emotion": "Playful",
      "style": "Retro Utility",
      "description": "Durable earthy palettes with bold primary pops and functional badges.",
      "devilsAdvocate": "Risks looking like camping gear rather than everyday apparel if colors are too muted."
    },
    {
      "id": "b",
      "title": "Mini Minimal",
      "tagline": "Quiet design for loud personalities",
      "emotion": "Warm",
      "style": "Nordic Modern",
      "description": "Clean silhouettes, generous negative space, and organic textures.",
      "devilsAdvocate": "May appeal to parents aesthetic but lack sensory engagement for actual kids."
    },
    {
      "id": "c",
      "title": "Wild Canvas",
      "tagline": "Clothes made to be lived in",
      "emotion": "Bold",
      "style": "Expressive Graphic",
      "description": "Hand-drawn organic shapes and vibrant, unapologetic color blocking.",
      "devilsAdvocate": "High print complexity might increase unit production costs early on."
    }
  ]
}

Now generate real, tailored values based on:
Brand: "${brandDescription}"
Emotions: ${emotions?.join(', ')}
`;

    // Using gemini-3.6-flash which succeeded in discovery
    const { text } = await generateText({
      model: google('gemini-3.6-flash'),
      system: "You are an elite Creative Director. You only respond with strictly valid JSON matching the requested structure. No markdown formatting, just raw JSON.",
      prompt,
    });

    const cleanJson = text.replace(/```json/i, '').replace(/```/g, '').trim();
    const parsedData = JSON.parse(cleanJson);

    return NextResponse.json(parsedData);
  } catch (error: any) {
    console.error("DNA Generation Error:", error);
    return NextResponse.json({ error: error?.message || "Failed to generate DNA" }, { status: 500 });
  }
}