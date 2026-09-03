"use client";

import { useState } from "react";
import { ArrowRight, Palette, X, Sparkles, Layers, Sliders, FileText } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  return (
    <main className="min-h-screen bg-[#F9F6F0] text-[#121212] flex flex-col justify-between p-6 md:p-16 selection:bg-[#B85D19] selection:text-white">
      
      {/* Editorial Header with Art Palette Logo */}
      <header className="w-full flex justify-between items-center border-b border-[#E2DACD] pb-6">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-full bg-[#121212] flex items-center justify-center text-[#F9F6F0] group-hover:bg-[#B85D19] transition-colors">
            <Palette className="w-4 h-4 stroke-[1.75]" />
          </div>
          <span className="font-serif text-2xl tracking-tight font-medium italic">
            Art Director
          </span>
        </Link>
       
      </header>

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto text-center space-y-8 my-auto py-12">
        <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#B85D19]">
          Autonomous Brand Direction & Aesthetics
        </span>
        
        <h1 className="text-3xl md:text-5xl font-serif font-normal tracking-tight leading-[1.08] text-[#121212]">
          Do not settle for generic ideas. 
          <span className="italic font-light text-[#B85D19]"> Architect distinct visual identity.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-[#121212]/70 max-w-2xl mx-auto leading-relaxed font-light">
          An editorial creative director engine that converts vague project visions into structured Mood DNA, contrasting design directions, and production-ready visual kits.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
          <Link 
            href="/session" 
            className="group flex items-center gap-3 bg-[#121212] text-[#F9F6F0] px-8 py-4 rounded-full text-sm font-medium hover:bg-[#B85D19] transition-all shadow-sm"
          >
            Enter Creative Session
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <button 
            onClick={() => setShowHowItWorks(true)}
            className="px-8 py-4 rounded-full text-sm font-medium text-[#121212] border border-[#E2DACD] hover:bg-[#EFE9DF] transition-colors"
          >
            See How It Works
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full flex flex-col sm:flex-row justify-between items-center text-xs text-[#121212]/50 border-t border-[#E2DACD] pt-6 gap-2">
        <span>Strategic visual synthesis by Zeemal Farooq</span>
        <span>Studio Edition</span>
      </footer>

      {/* "See How It Works" Interactive Modal */}
      {showHowItWorks && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#F9F6F0] border border-[#E2DACD] max-w-2xl w-full rounded-3xl p-8 shadow-2xl space-y-6 relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#E2DACD] pb-4">
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-[#B85D19]" />
                <h3 className="font-serif text-2xl font-medium">How Art Director Works</h3>
              </div>
              <button 
                onClick={() => setShowHowItWorks(false)}
                className="p-1 rounded-full hover:bg-[#EFE9DF] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="p-4 rounded-2xl bg-white border border-[#E2DACD] space-y-2">
                <div className="w-7 h-7 rounded-full bg-[#EFE9DF] flex items-center justify-center text-xs font-bold">1</div>
                <h4 className="font-semibold text-base">Discovery Dialogue</h4>
                <p className="text-[#121212]/70 text-xs leading-relaxed">
                  Describe your concept in natural terms. The engine probes positioning, tone, and market context without superficial prompts.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#E2DACD] space-y-2">
                <div className="w-7 h-7 rounded-full bg-[#EFE9DF] flex items-center justify-center text-xs font-bold">2</div>
                <h4 className="font-semibold text-base">Mood DNA Calibration</h4>
                <p className="text-[#121212]/70 text-xs leading-relaxed">
                  Lock in strategic emotional pillars. We compute quantitative aesthetic weights, define keywords, and flag industry clichés to avoid.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#E2DACD] space-y-2">
                <div className="w-7 h-7 rounded-full bg-[#EFE9DF] flex items-center justify-center text-xs font-bold">3</div>
                <h4 className="font-semibold text-base">Concept Battle</h4>
                <p className="text-[#121212]/70 text-xs leading-relaxed">
                  Evaluate three radical visual hypotheses accompanied by Devil's Advocate critiques exposing brand risks upfront.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#E2DACD] space-y-2">
                <div className="w-7 h-7 rounded-full bg-[#EFE9DF] flex items-center justify-center text-xs font-bold">4</div>
                <h4 className="font-semibold text-base">Production Suite</h4>
                <p className="text-[#121212]/70 text-xs leading-relaxed">
                  Export complete palette hex schemes, font hierarchies, studio lookbook renders, and download markdown project briefs.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Link
                href="/session"
                className="bg-[#121212] text-[#F9F6F0] px-6 py-2.5 rounded-full text-xs uppercase tracking-widest font-semibold hover:bg-[#B85D19] transition-colors"
              >
                Launch Studio Session →
              </Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}