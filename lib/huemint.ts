export interface HuemintColor {
  hex: string;
  role: string;
  name: string;
  usage: string;
}

export async function fetchHuemintCustom(
  currentPalette: string[],
  lockedMask: boolean[],
  temperature: number = 1.2
): Promise<string[] | null> {
  try {
    const payloadPalette = currentPalette.map((hex, i) => (lockedMask[i] ? hex : "-"));

    const response = await fetch("https://api.huemint.com/color", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "transformer",
        num_colors: 4,
        temperature: temperature,
        num_results: 1,
        adjacency: [
          "0", "65", "45", "35",
          "65", "0", "35", "65",
          "45", "35", "0", "35",
          "35", "65", "35", "0"
        ],
        palette: payloadPalette
      }),
    });

    if (!response.ok) return null;
    const data = await response.json();
    return data.results?.[0]?.palette || null;
  } catch (error) {
    console.warn("Huemint API call failed:", error);
    return null;
  }
}

// Backward-compatible export for studio and refine routes
export async function fetchHuemintPalette(
  temperature: number = 1.2,
  mode: "transformer" | "diffusion" = "transformer"
): Promise<string[] | null> {
  return fetchHuemintCustom(["-", "-", "-", "-"], [false, false, false, false], temperature);
}