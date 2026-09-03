import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  let prompt = "";
  let brandName = "";
  let primaryColor = "accent";
  let baseColor = "neutral";
  let headingFont = "editorial serif";
  let bodyFont = "clean sans serif";
  let conceptStyle = "editorial brand direction";

  try {
    const body = await req.json();
    prompt = body.prompt || "";
    brandName = body.brandName || "Brand";
    primaryColor = body.primaryColor || "accent";
    baseColor = body.baseColor || "neutral";
    headingFont = body.headingFont || "editorial serif";
    bodyFont = body.bodyFont || "clean sans serif";
    conceptStyle = body.conceptStyle || "editorial brand direction";

    const cleanSubject = brandName || prompt;
    const socialPrompt = `Create a relevant high-end square editorial brand photograph for this exact idea: "${cleanSubject}". Visual subject and setting must clearly communicate the product, service, or event in that idea. Follow this AI art direction brief: "${prompt}". Direction: ${conceptStyle}. Palette inspiration: ${baseColor}, ${primaryColor}. Use tangible objects, believable materials, intentional composition, and premium studio or natural light. This is source artwork for an Instagram post, not a finished poster: absolutely no words, letters, logos, watermarks, UI, fake typography, or random products. The final image should leave calm negative space for a real text overlay using ${headingFont} and ${bodyFont}. Photorealistic, art-directed, square 1:1 composition.`;

    const apiKey = process.env.HUGGINGFACE_API_KEY;

    // Try Hugging Face if key is present
    if (apiKey && apiKey.startsWith("hf_")) {
      const response = await fetch(
        "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell",
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({
            inputs: socialPrompt,
            parameters: {
              guidance_scale: 7.5,
              num_inference_steps: 4,
            },
          }),
        }
      );

      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        return NextResponse.json({ imageUrl: `data:image/jpeg;base64,${base64}` });
      }
      console.warn("Hugging Face API returned non-200, serving fallback render.");
    }

    // High-reliability backup: Pollinations Flux in square aspect ratio for Instagram feed
    const seed = Math.floor(Math.random() * 900000 + 100000);
    const encoded = encodeURIComponent(socialPrompt);
    const fallbackUrl = `https://image.pollinations.ai/prompt/${encoded}?width=1080&height=1080&model=flux&seed=${seed}&nologo=true`;

    return NextResponse.json({ imageUrl: fallbackUrl });
  } catch (error: unknown) {
    console.error("Image generation route error:", error instanceof Error ? error.message : error);
    // Return fallback URL even on complete network error
    const seed = Math.floor(Math.random() * 900000 + 100000);
    const encoded = encodeURIComponent(`Instagram feed post mockup for ${brandName || "modern brand"}, 8k resolution`);
    return NextResponse.json({ 
      imageUrl: `https://image.pollinations.ai/prompt/${encoded}?width=1080&height=1080&model=flux&seed=${seed}&nologo=true` 
    });
  }
}