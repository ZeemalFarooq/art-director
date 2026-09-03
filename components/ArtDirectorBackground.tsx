"use client";

import { AnimatedTopDock } from "./animated-top-dock/src/shaders/animated-top-dock/AnimatedTopDock";

export function ArtDirectorBackground() {
  return (
    <div className="art-director-background" aria-hidden="true">
      <AnimatedTopDock
        variant="glass"
        particles={22}
        thickness={0.115}
        dispersion={0.05}
        specular={0.85}
        rim={0.5}
        drift={1.0}
        proximity={44}
        heightGrowth={20}
        drop={11.0}
      />
    </div>
  );
}
