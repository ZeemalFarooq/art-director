import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  let prompt = "";
  let brandName = "";
  let primaryColor = "accent";
  let baseColor = "neutral";
  let headingFont = "editorial serif";

  try {
    const body = await req.json();
    prompt = body.prompt || "";
    brandName = body.brandName || "Brand";
    primaryColor = body.primaryColor || "accent";
    baseColor = body.baseColor || "neutral";
    headingFont = body.headingFont || "editorial serif";

    const cleanSubject = brandName || prompt;
    const socialPrompt = `A high-end square Instagram feed post mockup for "${cleanSubject}", professional graphic design layout, editorial social media brand campaign, featuring aesthetic product showcase with ${primaryColor} and ${baseColor} branded packaging, clean typography layout inspired by ${headingFont}, award winning branding photography, studio lighting, Behance featured, 8k resolution, crisp clean design composition`;

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
  } catch (error: any) {
    console.error("Image generation route error:", error);
    // Return fallback URL even on complete network error
    const seed = Math.floor(Math.random() * 900000 + 100000);
    const encoded = encodeURIComponent(`Instagram feed post mockup for ${brandName || "modern brand"}, 8k resolution`);
    return NextResponse.json({ 
      imageUrl: `https://image.pollinations.ai/prompt/${encoded}?width=1080&height=1080&model=flux&seed=${seed}&nologo=true` 
    });
  }
}