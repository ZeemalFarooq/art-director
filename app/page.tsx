import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F7F3ED] text-[#171717] flex flex-col items-center justify-center p-6 md:p-24 selection:bg-[#C56A35] selection:text-white">
      
      {/* Premium Minimal Header */}
      <div className="absolute top-0 left-0 w-full p-8 flex justify-between items-center">
        <div className="font-semibold tracking-tight text-xl">Art Director</div>
        <button className="text-sm font-medium hover:opacity-70 transition-opacity">
          Sign In
        </button>
      </div>

      {/* Hero Content */}
      <div className="max-w-3xl text-center space-y-8 mt-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8D8C3] text-sm font-medium text-[#171717]">
          <Sparkles className="w-4 h-4 text-[#C56A35]" />
          <span>v1.0 is now live</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[1.1]">
          Don't just generate ideas. <br />
          <span className="text-[#C56A35]">Develop better ones.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-[#171717]/70 max-w-2xl mx-auto leading-relaxed">
          Art Director is your AI creative partner for turning vague ideas into strategic, distinctive visual concepts and campaign briefs.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          {/* THIS IS THE FIXED BUTTON - Notice it is a <Link> tag now */}
          <Link href="/session" className="group flex items-center gap-2 bg-[#171717] text-[#F7F3ED] px-8 py-4 rounded-full font-medium hover:bg-[#171717]/90 transition-all">
            Start a Creative Session
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <button className="px-8 py-4 rounded-full font-medium text-[#171717] hover:bg-[#E8D8C3]/50 transition-colors">
            See how it works
          </button>
        </div>
      </div>
    </main>
  );
}