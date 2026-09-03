"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowUp, Sparkles, User, ArrowLeft, Check, Loader2, AlertTriangle, Swords, Palette, Type, Copy, Download } from "lucide-react";
import Link from "next/link";

const EMOTIONS = [
  { id: "energetic", label: "☀️ Energetic" },
  { id: "sophisticated", label: "🌙 Sophisticated" },
  { id: "calm", label: "🌿 Calm" },
  { id: "bold", label: "🔥 Bold" },
  { id: "warm", label: "❤️ Warm" },
  { id: "playful", label: "🎈 Playful" },
];

interface Concept {
  id: string;
  title: string;
  tagline: string;
  emotion: string;
  style: string;
  description: string;
  devilsAdvocate: string;
}

interface BrandData {
  dna: {
    sophistication: number;
    energy: number;
    warmth: number;
    playfulness: number;
    minimalism: number;
  };
  personality: string;
  keywords: string[];
  avoid: string[];
  concepts: Concept[];
}

interface StudioData {
  colors: { role: string; hex: string; name: string; usage: string }[];
  typography: {
    heading: { font: string; style: string };
    body: { font: string; style: string };
  };
  heroPrompt: string;
  creativeBrief: {
    coreThesis: string;
    doList: string[];
    dontList: string[];
  };
}

export default function SessionPage() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCards, setShowCards] = useState(false);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [brandDesc, setBrandDesc] = useState("");
  const [brandData, setBrandData] = useState<BrandData | null>(null);
  const [generatingDna, setGeneratingDna] = useState(false);
  const [selectedConcept, setSelectedConcept] = useState<string | null>(null);
  const [studioLoading, setStudioLoading] = useState(false);
  const [studioData, setStudioData] = useState<StudioData | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Let's build something memorable. First, tell me about the brand in your own words. What do you do, and who is your target audience?",
    }
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, showCards, loading, brandData, generatingDna, studioData]);

  const handleSend = async (e?: React.FormEvent | React.MouseEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || showCards || loading) return;

    const userText = input;
    setInput("");
    setBrandDesc(userText);
    setMessages((prev) => [...prev, { role: "user", content: userText }]);
    setLoading(true);

    try {
      const res = await fetch("/api/discovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userMessage: userText }),
      });

      const data = await res.json();
      if (data.reply) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
        setShowCards(true);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  const toggleEmotion = (id: string) => {
    setSelectedEmotions((prev) => 
      prev.includes(id) 
        ? prev.filter(e => e !== id) 
        : prev.length < 3 ? [...prev, id] : prev
    );
  };

  const submitEmotions = async () => {
    const emotionLabels = selectedEmotions
      .map(id => EMOTIONS.find(e => e.id === id)?.label)
      .join(", ");
      
    setMessages((prev) => [...prev, { role: "user", content: `Emotions: ${emotionLabels}` }]);
    setShowCards(false);
    setGeneratingDna(true);

    try {
      const res = await fetch("/api/dna", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandDescription: brandDesc,
          emotions: selectedEmotions,
        }),
      });

      const data = await res.json();
      if (data.dna && data.concepts) {
        setBrandData(data);
      }
    } catch (err) {
      console.error("Failed to generate DNA:", err);
      setShowCards(true);
    } finally {
      setGeneratingDna(false);
    }
  };

  const generateStudio = async () => {
    if (!selectedConcept || !brandData) return;
    const conceptObj = brandData.concepts.find(c => c.id === selectedConcept);
    if (!conceptObj) return;

    setStudioLoading(true);
    try {
      const res = await fetch("/api/studio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandDescription: brandDesc,
          selectedConcept: conceptObj,
          personality: brandData.personality,
        }),
      });
      const data = await res.json();
      if (data.colors) {
        setStudioData(data);
      }
    } catch (err) {
      console.error("Studio generation failed:", err);
    } finally {
      setStudioLoading(false);
    }
  };

  const copyHeroPrompt = () => {
    if (!studioData) return;
    navigator.clipboard.writeText(studioData.heroPrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const exportBrief = () => {
    if (!studioData || !brandData) return;
    const activeConcept = brandData.concepts.find(c => c.id === selectedConcept);
    const content = `# Creative Direction Brief: ${activeConcept?.title}
**Brand:** ${brandDesc}
**Personality:** ${brandData.personality}

## Chosen Concept
- **Style:** ${activeConcept?.style}
- **Tagline:** "${activeConcept?.tagline}"
- **Summary:** ${activeConcept?.description}

## Color Palette
${studioData.colors.map(c => `- **${c.name}** (${c.hex}) - ${c.role}: ${c.usage}`).join('\n')}

## Typography
- **Heading:** ${studioData.typography.heading.font} (${studioData.typography.heading.style})
- **Body:** ${studioData.typography.body.font} (${studioData.typography.body.style})

## Core Strategic Thesis
${studioData.creativeBrief.coreThesis}

## Rules of Execution
### What to Do
${studioData.creativeBrief.doList.map(item => `- [x] ${item}`).join('\n')}

### What to Avoid
${studioData.creativeBrief.dontList.map(item => `- [ ] Avoid: ${item}`).join('\n')}

## Hero Image Generation Prompt (Midjourney / Flux)
\`\`\`
${studioData.heroPrompt}
\`\`\`
`;

    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `creative-brief-${selectedConcept}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F3ED] text-[#171717]">
      <header className="sticky top-0 z-20 flex items-center justify-between p-6 bg-[#F7F3ED]/80 backdrop-blur-md border-b border-[#E8D8C3]">
        <Link href="/" className="flex items-center gap-2 text-sm font-medium hover:opacity-60 transition-opacity">
          <ArrowLeft className="w-4 h-4" />
          Exit Session
        </Link>
        <span className="text-xs uppercase tracking-widest font-semibold px-3 py-1 bg-[#E8D8C3] rounded-full">
          Art Director Studio
        </span>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto p-6 pb-40 flex flex-col gap-8">
        {/* Chat Timeline */}
        {messages.map((msg, index) => (
          <div key={index} className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" ? (
              <div className="flex gap-4 max-w-[85%]">
                <div className="w-8 h-8 rounded-full bg-[#E8D8C3] flex items-center justify-center shrink-0 mt-1">
                  <Sparkles className="w-4 h-4 text-[#C56A35]" />
                </div>
                <div className="text-xl leading-relaxed tracking-tight font-medium text-[#171717]">
                  {msg.content}
                </div>
              </div>
            ) : (
              <div className="flex gap-4 max-w-[85%] flex-row-reverse">
                <div className="w-8 h-8 rounded-full bg-[#171717] flex items-center justify-center shrink-0 mt-1">
                  <User className="w-4 h-4 text-[#F7F3ED]" />
                </div>
                <div className="text-lg leading-relaxed bg-[#171717] text-[#F7F3ED] px-6 py-4 rounded-3xl rounded-tr-sm">
                  {msg.content}
                </div>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 items-center text-[#171717]/60 ml-2">
            <Loader2 className="w-5 h-5 animate-spin text-[#C56A35]" />
            <span className="text-sm font-medium">Art Director is evaluating your concept...</span>
          </div>
        )}

        {/* Emotion Cards */}
        {showCards && (
          <div className="ml-12 grid grid-cols-2 md:grid-cols-3 gap-3">
            {EMOTIONS.map((emotion) => {
              const isSelected = selectedEmotions.includes(emotion.id);
              return (
                <button
                  key={emotion.id}
                  onClick={() => toggleEmotion(emotion.id)}
                  type="button"
                  className={`px-4 py-4 rounded-2xl border-2 text-left font-medium transition-all ${
                    isSelected 
                      ? "border-[#171717] bg-[#171717] text-[#F7F3ED]" 
                      : "border-[#E8D8C3] bg-white hover:border-[#C56A35]"
                  }`}
                >
                  {emotion.label}
                </button>
              );
            })}
            
            {selectedEmotions.length > 0 && (
              <div className="col-span-full mt-2 flex justify-end">
                <button 
                  onClick={submitEmotions}
                  type="button"
                  className="flex items-center gap-2 bg-[#C56A35] text-white px-6 py-3 rounded-full font-medium hover:bg-[#a6572b] transition-colors"
                >
                  <Check className="w-4 h-4" />
                  Analyze Brand DNA
                </button>
              </div>
            )}
          </div>
        )}

        {generatingDna && (
          <div className="p-8 rounded-3xl bg-white border border-[#E8D8C3] flex flex-col items-center justify-center gap-4 text-center my-6">
            <Loader2 className="w-8 h-8 animate-spin text-[#C56A35]" />
            <div>
              <h3 className="text-lg font-bold">Synthesizing Mood DNA & Concept Battler</h3>
              <p className="text-sm text-[#171717]/60">Extracting visual archetypes and challenging clichés...</p>
            </div>
          </div>
        )}

        {/* Brand DNA Visualizer */}
        {brandData && brandData.dna && (
          <div className="space-y-12">
            <div className="border-t border-[#E8D8C3] pt-10">
              <span className="text-xs uppercase tracking-widest font-bold text-[#C56A35]">Visual Blueprint</span>
              <h2 className="text-3xl font-extrabold tracking-tight mt-1">Brand's Mood DNA</h2>
              <p className="text-sm text-[#171717]/70 mt-1">Archetype: <span className="font-semibold text-[#171717]">{brandData.personality}</span></p>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-3xl border border-[#E8D8C3] space-y-4 shadow-sm">
              {Object.entries(brandData.dna).map(([trait, score]) => (
                <div key={trait} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold uppercase tracking-wider">
                    <span>{trait}</span>
                    <span>{score}%</span>
                  </div>
                  <div className="h-2 w-full bg-[#F7F3ED] rounded-full overflow-hidden">
                    <div className="h-full bg-[#171717] rounded-full transition-all duration-1000" style={{ width: `${score}%` }} />
                  </div>
                </div>
              ))}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[#E8D8C3]">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#C56A35]">Keywords</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {brandData.keywords.map((kw, i) => (
                      <span key={i} className="text-xs px-3 py-1 rounded-full bg-[#E8D8C3] font-medium">{kw}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-red-600">Avoid (Clichés)</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {brandData.avoid.map((av, i) => (
                      <span key={i} className="text-xs px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 font-medium line-through">{av}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Concept Battle */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Swords className="w-6 h-6 text-[#C56A35]" />
                <h2 className="text-2xl font-bold tracking-tight">Concept Battle: Choose Your Direction</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {brandData.concepts.map((concept) => {
                  const isChosen = selectedConcept === concept.id;
                  return (
                    <div 
                      key={concept.id}
                      onClick={() => setSelectedConcept(concept.id)}
                      className={`cursor-pointer rounded-3xl p-6 flex flex-col justify-between transition-all border-2 ${
                        isChosen
                          ? "bg-[#171717] text-[#F7F3ED] border-[#171717] scale-[1.02] shadow-xl"
                          : "bg-white text-[#171717] border-[#E8D8C3] hover:border-[#C56A35]"
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                            isChosen ? "bg-[#C56A35] text-white" : "bg-[#E8D8C3] text-[#171717]"
                          }`}>
                            Concept {concept.id.toUpperCase()}
                          </span>
                          <span className="text-xs opacity-60 font-medium">{concept.style}</span>
                        </div>

                        <h3 className="text-xl font-bold">{concept.title}</h3>
                        <p className={`text-xs italic ${isChosen ? "text-[#E8D8C3]" : "text-[#171717]/70"}`}>
                          "{concept.tagline}"
                        </p>
                        <p className="text-sm leading-relaxed opacity-80">{concept.description}</p>
                      </div>

                      <div className={`mt-6 p-4 rounded-2xl border text-xs space-y-1 ${
                        isChosen 
                          ? "bg-white/10 border-white/20 text-[#F7F3ED]" 
                          : "bg-amber-50 border-amber-200 text-amber-900"
                      }`}>
                        <div className="flex items-center gap-1.5 font-bold">
                          <AlertTriangle className="w-3.5 h-3.5 text-[#C56A35]" />
                          <span>Devil's Advocate</span>
                        </div>
                        <p className="leading-snug opacity-90">{concept.devilsAdvocate}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {selectedConcept && !studioData && (
                <div className="mt-8 flex justify-center">
                  <button 
                    onClick={generateStudio}
                    disabled={studioLoading}
                    className="bg-[#C56A35] text-white px-8 py-4 rounded-full font-bold shadow-lg hover:bg-[#a6572b] transition-all flex items-center gap-2"
                  >
                    {studioLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Forging Creative Assets...
                      </>
                    ) : (
                      <>Generate Brand Kit: Concept {selectedConcept.toUpperCase()} →</>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* ASSET STUDIO */}
            {studioData && (
              <div className="space-y-10 border-t border-[#E8D8C3] pt-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs uppercase tracking-widest font-bold text-[#C56A35]">Production Kit</span>
                    <h2 className="text-3xl font-extrabold tracking-tight">Art Director's Execution Suite</h2>
                  </div>
                  <button
                    onClick={exportBrief}
                    className="flex items-center gap-2 bg-[#171717] text-[#F7F3ED] px-5 py-3 rounded-full text-sm font-semibold hover:bg-black transition-colors self-start"
                  >
                    <Download className="w-4 h-4" />
                    Download Brand Kit (.md)
                  </button>
                </div>

                {/* Color Palette Swatches */}
                <div className="bg-white p-6 md:p-8 rounded-3xl border border-[#E8D8C3] space-y-6">
                  <div className="flex items-center gap-2">
                    <Palette className="w-5 h-5 text-[#C56A35]" />
                    <h3 className="font-bold text-lg">Curated Color System</h3>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {studioData.colors.map((c, i) => (
                      <div key={i} className="flex flex-col gap-2 p-3 rounded-2xl border border-[#E8D8C3]/60 bg-[#F7F3ED]/30">
                        <div 
                          className="h-20 w-full rounded-xl shadow-inner border border-black/5" 
                          style={{ backgroundColor: c.hex }} 
                        />
                        <div>
                          <span className="text-xs font-semibold text-[#171717]/60 block">{c.role}</span>
                          <span className="font-bold text-sm block">{c.name}</span>
                          <code className="text-xs bg-[#E8D8C3]/50 px-1.5 py-0.5 rounded font-mono mt-1 inline-block">{c.hex}</code>
                        </div>
                        <p className="text-xs text-[#171717]/70 leading-relaxed mt-1">{c.usage}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Typography System */}
                <div className="bg-white p-6 md:p-8 rounded-3xl border border-[#E8D8C3] space-y-6">
                  <div className="flex items-center gap-2">
                    <Type className="w-5 h-5 text-[#C56A35]" />
                    <h3 className="font-bold text-lg">Type Hierarchy</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-5 rounded-2xl border border-[#E8D8C3] bg-[#F7F3ED]/40">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#C56A35]">Display & Headers</span>
                      <h4 className="text-2xl font-serif font-bold mt-2">{studioData.typography.heading.font}</h4>
                      <p className="text-xs text-[#171717]/70 mt-1">{studioData.typography.heading.style}</p>
                    </div>

                    <div className="p-5 rounded-2xl border border-[#E8D8C3] bg-[#F7F3ED]/40">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#C56A35]">Body & Interface</span>
                      <h4 className="text-xl font-sans font-medium mt-2">{studioData.typography.body.font}</h4>
                      <p className="text-xs text-[#171717]/70 mt-1">{studioData.typography.body.style}</p>
                    </div>
                  </div>
                </div>

                {/* Image Generation Prompt */}
                <div className="bg-white p-6 md:p-8 rounded-3xl border border-[#E8D8C3] space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-[#C56A35]" />
                      <h3 className="font-bold text-lg">Hero Production Prompt</h3>
                    </div>
                    <button 
                      onClick={copyHeroPrompt}
                      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-[#E8D8C3] rounded-full hover:bg-[#C56A35] hover:text-white transition-colors"
                    >
                      {copiedPrompt ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedPrompt ? "Copied" : "Copy Prompt"}
                    </button>
                  </div>
                  <p className="text-xs text-[#171717]/70">Paste directly into Midjourney, Flux, or DALL-E to generate campaign imagery adhering to your creative direction:</p>
                  <pre className="p-4 rounded-2xl bg-[#171717] text-[#F7F3ED] text-xs leading-relaxed font-mono whitespace-pre-wrap">
                    {studioData.heroPrompt}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* Discovery Input Bar */}
      {!brandData && (
        <div className="fixed bottom-0 left-0 w-full bg-gradient-to-t from-[#F7F3ED] via-[#F7F3ED] to-transparent pt-10 pb-8 px-6 z-10">
          <div className="max-w-3xl mx-auto relative">
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={showCards || loading || generatingDna}
                placeholder={
                  loading 
                    ? "Art Director is thinking..." 
                    : showCards 
                    ? "Please select emotions above..." 
                    : "e.g. A small clothing brand for kids..."
                }
                className="w-full bg-white border border-[#E8D8C3] rounded-full pl-6 pr-14 py-4 text-lg focus:outline-none focus:border-[#C56A35] shadow-sm transition-colors disabled:opacity-50"
              />
              <button 
                type="button"
                onClick={handleSend}
                disabled={!input.trim() || showCards || loading || generatingDna}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#171717] text-[#F7F3ED] rounded-full flex items-center justify-center hover:bg-[#C56A35] disabled:opacity-50 transition-all"
              >
                <ArrowUp className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}