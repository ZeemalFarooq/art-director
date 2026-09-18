"use client";

import { useState } from "react";
import { ArrowRight, Palette, X, HelpCircle } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  return (
    <main className="home-shell min-h-screen text-[#111318] flex flex-col px-6 py-4 md:px-14 md:py-5 selection:bg-[#315EF6] selection:text-white relative">
      
      {/* HEADER */}
      <header className="w-full flex justify-between items-center border-b border-[#D8E2EE] pb-3 shrink-0 relative z-20">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-full bg-[#111318] flex items-center justify-center text-[#F7F8F4] group-hover:bg-[#315EF6] transition-colors duration-300">
            <Palette className="w-4 h-4 stroke-[1.75]" />
          </div>
          <span className="font-serif text-xl tracking-tight font-medium italic text-[#111318]">
            Art Director
          </span>
        </Link>

        {/* Top-Right Metrics */}
        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#D8E2EE] text-[10px] font-mono text-[#475569] shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#315EF6] animate-pulse" />
            <span>Huemint AI + Fontjoy</span>
          </div>

          <button
            onClick={() => setShowHowItWorks(true)}
            className="flex items-center gap-1.5 text-xs font-medium px-3.5 py-1.5 rounded-full bg-white border border-[#D8E2EE] text-[#111318] hover:border-[#315EF6] hover:text-[#315EF6] transition-all shadow-xs"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Methodology</span>
          </button>

          <Link
            href="/session"
            className="flex items-center gap-1 text-xs font-semibold px-4 py-1.5 rounded-full bg-[#315EF6] hover:bg-[#254edb] text-white transition-all shadow-xs"
          >
            <span>Launch</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="hero-grid max-w-7xl mx-auto w-full flex-1 py-10 md:py-16">
        
        {/* LEFT COPY */}
        <div className="hero-copy space-y-4 md:space-y-5 relative z-10">
          <span className="eyebrow text-xs uppercase tracking-[0.22em] font-semibold text-[#315EF6]">
            Autonomous Brand Direction {'&'} Aesthetics
          </span>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-serif font-normal tracking-tight leading-[1.08] text-[#111318]">
            Make the idea
            <span className="block italic font-light text-[#315EF6]">
              impossible to ignore.
            </span>
          </h1>

          <p className="text-sm md:text-base text-[#111318]/70 max-w-lg leading-relaxed font-light">
            An editorial creative director engine that converts vague project visions into structured Mood DNA, contrasting design directions, and production-ready visual kits.
          </p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-2">
            <Link
              href="/session"
              className="group flex items-center gap-3 bg-[#111318] text-[#F7F8F4] px-6 py-3 rounded-full text-xs font-medium hover:bg-[#315EF6] transition-all duration-300 shadow-sm"
            >
              <span>Enter Creative Session</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <button
              onClick={() => setShowHowItWorks(true)}
              className="px-6 py-3 rounded-full text-xs font-medium text-[#111318] border border-[#cdd2cc] hover:border-[#315EF6] hover:text-[#315EF6] hover:bg-[#edf2ff] transition-all duration-300"
            >
              See How It Works
            </button>
          </div>
        </div>

        {/* RIGHT 3D PRISM VISUAL */}
        <div className="prism-stage" aria-hidden="true">
          <div className="visual-glow" />
          <div className="visual-grid" />

          <div className="visual-ring ring-one" />
          <div className="visual-ring ring-two" />
          <div className="visual-ring ring-three" />

          <div className="floating-label">Visual Intelligence / 01</div>
          <div className="coordinate">42.18deg -- 73.09deg -- FORM / SYSTEM</div>
          <div className="floating-number">01</div>

          <div className="floating-dot dot-one" />
          <div className="floating-dot dot-two" />

          <div className="mini-card card-top">
            <div className="mini-card-line blue" />
            <div className="mini-card-line" />
            <div className="mini-card-line short" />
            <div className="mt-2 text-[7px] tracking-[0.25em] uppercase text-[#111318]/50 font-mono">
              Direction
            </div>
          </div>

          <div className="mini-card card-bottom">
            <div className="mini-card-circle" />
            <div className="mini-card-line blue" />
            <div className="mini-card-line" />
            <div className="mini-card-line short" />
            <div className="mt-2 text-[7px] tracking-[0.2em] uppercase text-[#111318]/50 font-mono">
              Mood DNA
            </div>
          </div>

          <div className="prism-shadow" />

          <div className="prism-scene">
            <div className="prism prism-back">
              <span>FORM</span>
            </div>
            <div className="prism prism-mid">
              <span>MOOD</span>
            </div>
            <div className="prism prism-front">
              <span>DNA</span>
            </div>
            <div className="prism prism-orbit orbit-one" />
            <div className="prism-orbit orbit-two" />
          </div>

          <div className="stage-caption">
            Strategic visual synthesis by Zeemal Farooq
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full flex justify-between items-center text-[11px] font-mono text-[#111318]/50 border-t border-[#D8E2EE] pt-3 shrink-0 relative z-20">
        <span>Studio Edition &copy; 2026</span>
        <div className="flex items-center gap-4">
          <Link href="/session" className="hover:text-[#315EF6] transition-colors">Launch Workspace</Link>
        </div>
      </footer>

      {/* MODAL */}
      {showHowItWorks && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#F4F7FB] border border-[#dce0da] max-w-2xl w-full rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#dce0da] pb-3">
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-[#315EF6]" />
                <h3 className="font-serif text-xl sm:text-2xl font-medium">
                  How Art Director Works
                </h3>
              </div>
              <button
                onClick={() => setShowHowItWorks(false)}
                className="p-1 rounded-full hover:bg-[#e9edff] hover:text-[#315EF6] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-sm">
              <div className="p-4 rounded-2xl bg-white border border-[#dce0da] space-y-2 hover:border-[#b9c7ff] transition-colors">
                <div className="w-6 h-6 rounded-full bg-[#e8edff] text-[#315EF6] flex items-center justify-center text-xs font-bold">1</div>
                <h4 className="font-semibold text-sm text-[#111318]">Discovery Dialogue</h4>
                <p className="text-[#111318]/65 text-xs leading-relaxed">
                  Describe your concept in natural terms. The engine probes positioning, tone, and market context without superficial prompts.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#dce0da] space-y-2 hover:border-[#b9c7ff] transition-colors">
                <div className="w-6 h-6 rounded-full bg-[#e8edff] text-[#315EF6] flex items-center justify-center text-xs font-bold">2</div>
                <h4 className="font-semibold text-sm text-[#111318]">Mood DNA Calibration</h4>
                <p className="text-[#111318]/65 text-xs leading-relaxed">
                  Lock in strategic emotional pillars. We compute quantitative aesthetic weights, define keywords, and flag industry clichés upfront.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#dce0da] space-y-2 hover:border-[#b9c7ff] transition-colors">
                <div className="w-6 h-6 rounded-full bg-[#e8edff] text-[#315EF6] flex items-center justify-center text-xs font-bold">3</div>
                <h4 className="font-semibold text-sm text-[#111318]">Concept Battle</h4>
                <p className="text-[#111318]/65 text-xs leading-relaxed">
                  Evaluate three radical visual hypotheses accompanied by Devil&apos;s Advocate critiques exposing brand risks upfront.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#dce0da] space-y-2 hover:border-[#b9c7ff] transition-colors">
                <div className="w-6 h-6 rounded-full bg-[#e8edff] text-[#315EF6] flex items-center justify-center text-xs font-bold">4</div>
                <h4 className="font-semibold text-sm text-[#111318]">Production Suite</h4>
                <p className="text-[#111318]/65 text-xs leading-relaxed">
                  Export complete palette hex schemes via Huemint, Fontjoy typography pairings, and photorealistic lookbook renders.
                </p>
              </div>
            </div>

            <div className="pt-1 flex justify-end">
              <Link
                href="/session"
                className="bg-[#111318] text-[#F7F8F4] px-5 py-2.5 rounded-full text-xs uppercase tracking-widest font-semibold hover:bg-[#315EF6] transition-colors"
              >
                Launch Studio Session {'->'}
              </Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}