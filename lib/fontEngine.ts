export interface FontItem {
  font: string;
  style: string;
  category: "serif" | "sans" | "display" | "mono";
}

export interface FontjoySystem {
  heading: FontItem;
  subhead: FontItem;
  body: FontItem;
}

export interface TypographyPairing {
  heading: FontItem;
  body: FontItem;
  contrastLevel: "high" | "balanced" | "subtle";
}

export const POPULAR_HEADINGS: FontItem[] = [
  { font: "Fraunces", style: "Variable serif, soft curves, 800 weight", category: "serif" },
  { font: "Syne", style: "Expansive display grotesque, 800 weight", category: "display" },
  { font: "Cabinet Grotesk", style: "Architectural Swiss grotesque, 800 weight", category: "display" },
  { font: "Cormorant Garamond", style: "Editorial classical serif, 700 weight", category: "serif" },
  { font: "Space Grotesk", style: "Technical mono-hybrid sans, 700 weight", category: "display" },
  { font: "Playfair Display", style: "High-contrast luxury serif, 700 weight", category: "serif" },
  { font: "Clash Display", style: "Flamboyant contemporary headline sans, 700 weight", category: "display" }
];

export const POPULAR_SUBHEADS: FontItem[] = [
  { font: "Plus Jakarta Sans", style: "Semi-bold geometric, 600 weight", category: "sans" },
  { font: "General Sans", style: "Clean Swiss proportions, 600 weight", category: "sans" },
  { font: "Outfit", style: "Warm modern sans, 500 weight", category: "sans" },
  { font: "Newsreader", style: "Refined companion serif, 500 weight", category: "serif" },
  { font: "DM Sans", style: "Crisp grotesque, 600 weight", category: "sans" }
];

export const POPULAR_BODIES: FontItem[] = [
  { font: "Inter", style: "Neutral functional sans, 400 weight, 1.6 line-height", category: "sans" },
  { font: "Plus Jakarta Sans", style: "Open aperture geometric, 400 weight", category: "sans" },
  { font: "DM Sans", style: "Balanced geometric legible, 400 weight", category: "sans" },
  { font: "Source Sans 3", style: "Humanist clear reading sans, 400 weight", category: "sans" },
  { font: "Lora", style: "Contemporary fluid serif for body reading, 400 weight", category: "serif" }
];

export function getFontjoyGeneration(
  current: FontjoySystem,
  locked: { heading: boolean; subhead: boolean; body: boolean },
  contrast: "high" | "balanced" | "similar"
): FontjoySystem {
  const pickRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

  let nextHeading = locked.heading ? current.heading : pickRandom(POPULAR_HEADINGS);
  let nextSubhead = locked.subhead ? current.subhead : pickRandom(POPULAR_SUBHEADS);
  let nextBody = locked.body ? current.body : pickRandom(POPULAR_BODIES);

  if (contrast === "similar" && !locked.body && nextHeading.category === "serif") {
    nextBody = { font: "Lora", style: "Matched literary serif, 400 weight", category: "serif" };
  } else if (contrast === "high" && !locked.body && nextHeading.category === "serif") {
    nextBody = { font: "Inter", style: "High-contrast neutral sans, 400 weight", category: "sans" };
  }

  return { heading: nextHeading, subhead: nextSubhead, body: nextBody };
}

// Backward-compatible export for studio/route.ts
export function getCuratedFontPairing(personality?: string): TypographyPairing {
  const normalized = (personality || "").toLowerCase();
  
  if (normalized.includes("playful") || normalized.includes("energetic")) {
    return { heading: POPULAR_HEADINGS[1], body: POPULAR_BODIES[0], contrastLevel: "high" }; // Syne + Inter
  }
  if (normalized.includes("sophisticated") || normalized.includes("calm")) {
    return { heading: POPULAR_HEADINGS[0], body: POPULAR_BODIES[1], contrastLevel: "high" }; // Fraunces + Plus Jakarta Sans
  }
  if (normalized.includes("bold") || normalized.includes("minimal")) {
    return { heading: POPULAR_HEADINGS[4], body: POPULAR_BODIES[2], contrastLevel: "balanced" }; // Space Grotesk + DM Sans
  }
  
  return {
    heading: POPULAR_HEADINGS[0],
    body: POPULAR_BODIES[0],
    contrastLevel: "high"
  };
}

export function generateGoogleFontUrl(heading: string, subhead: string = "Plus Jakarta Sans", body: string = "Inter"): string {
  const clean = (f: string) => (f ? f.split('/')[0].trim().replace(/\s+/g, '+') : 'Inter');
  const unique = Array.from(new Set([clean(heading), clean(subhead), clean(body)]));
  const families = unique.map(f => `family=${f}:wght@400;500;600;700;800`).join("&");
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}