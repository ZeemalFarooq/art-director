"use client";

import { useState, useRef, useEffect } from "react";
import { 
  ArrowUp, Palette, User, ArrowLeft, Check, Loader2, 
  AlertTriangle, Swords, Type, Copy, Download, 
  History, X, Image as ImageIcon, RefreshCw, Trash2, Edit3
} from "lucide-react";
import Link from "next/link";

// Clean, emoji-free aesthetic dimensions
const EMOTIONS = [
  { id: "energetic", label: "Energetic" },
  { id: "sophisticated", label: "Sophisticated" },
  { id: "calm", label: "Calm" },
  { id: "bold", label: "Bold" },
  { id: "warm", label: "Warm" },
  { id: "playful", label: "Playful" },
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

interface SavedSession {
  id: string;
  date: string;
  brandDesc: string;
  personality: string;
  selectedConcept: string;
  brandData: BrandData;
  studioData: StudioData;
  imageUrl?: string;
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

  // Editable prompt & Lookbook image state
  const [activePrompt, setActivePrompt] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);

  // History Drawer State
  const [historyOpen, setHistoryOpen] = useState(false);
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Let us define your visual landscape. Describe your brand, product, and audience in your own words.",
    }
  ]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("art_director_sessions");
      if (stored) setSavedSessions(JSON.parse(stored));
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, showCards, loading, brandData, generatingDna, studioData, imageUrl]);

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
      
    setMessages((prev) => [...prev, { role: "user", content: `Aesthetic Pillars: ${emotionLabels}` }]);
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
        setActivePrompt(data.heroPrompt);
        triggerFluxRender(data.heroPrompt);
        saveSessionToHistory(data);
      }
    } catch (err) {
      console.error("Studio generation failed:", err);
    } finally {
      setStudioLoading(false);
    }
  };

  const triggerFluxRender = (promptText: string) => {
    setImageLoading(true);
    const cleanPrompt = encodeURIComponent(
      `${promptText}, award winning lookbook photography, photorealistic, 8k, highly detailed, centered composition, soft shadows, no distortion`
    );
    const seed = Math.floor(Math.random() * 999999);
    const url = `https://image.pollinations.ai/prompt/${cleanPrompt}?width=1280&height=800&model=flux&seed=${seed}&nologo=true`;

    const img = new Image();
    img.src = url;
    img.onload = () => {
      setImageUrl(url);
      setImageLoading(false);
    };
    img.onerror = () => {
      setImageLoading(false);
    };
  };

  const saveSessionToHistory = (studio: StudioData) => {
    if (!brandData || !selectedConcept) return;
    const newSession: SavedSession = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      brandDesc,
      personality: brandData.personality,
      selectedConcept,
      brandData,
      studioData: studio,
      imageUrl: imageUrl || undefined,
    };

    setSavedSessions((prev) => {
      const updated = [newSession, ...prev.slice(0, 14)];
      localStorage.setItem("art_director_sessions", JSON.stringify(updated));
      return updated;
    });
  };

  const loadPastSession = (s: SavedSession) => {
    setBrandDesc(s.brandDesc);
    setBrandData(s.brandData);
    setSelectedConcept(s.selectedConcept);
    setStudioData(s.studioData);
    setActivePrompt(s.studioData.heroPrompt);
    setImageUrl(s.imageUrl || null);
    setHistoryOpen(false);
  };

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedSessions((prev) => {
      const filtered = prev.filter(item => item.id !== id);
      localStorage.setItem("art_director_sessions", JSON.stringify(filtered));
      return filtered;
    });
  };

  const copyHeroPrompt = () => {
    navigator.clipboard.writeText(activePrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const exportBrief = () => {
    if (!studioData || !brandData) return;
    const activeConcept = brandData.concepts.find(c => c.id === selectedConcept);
    const content = `# Creative Direction Brief: ${activeConcept?.title}
**Brand:** ${brandDesc}
**Personality:** ${brandData.personality}

## Concept Direction
- **Style:** ${activeConcept?.style}
- **Tagline:** "${activeConcept?.tagline}"
- **Summary:** ${activeConcept?.description}

## Curated Color System
${studioData.colors.map(c => `- **${c.name}** (${c.hex}) - ${c.role}: ${c.usage}`).join('\n')}

## Typography Pairing
- **Heading:** ${studioData.typography.heading.font} (${studioData.typography.heading.style})
- **Body:** ${studioData.typography.body.font} (${studioData.typography.body.style})

## Core Strategic Thesis
${studioData.creativeBrief.coreThesis}

## Execution Directives
### Permitted
${studioData.creativeBrief.doList.map(item => `- [x] ${item}`).join('\n')}

### Prohibited
${studioData.creativeBrief.dontList.map(item => `- [ ] Avoid: ${item}`).join('\n')}

## Visual Prompt
\`\`\`
${activePrompt}
\`\`\`
`;

    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `brand-brief-${selectedConcept}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F9F6F0] text-[#121212] selection:bg-[#B85D19] selection:text-white">
      {/* Studio Header */}
      <header className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-[#F9F6F0]/85 backdrop-blur-md border-b border-[#E2DACD]">
        <Link href="/" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider hover:text-[#B85D19] transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Exit Studio
        </Link>
        
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#121212] flex items-center justify-center text-[#F9F6F0]">
            <Palette className="w-3.5 h-3.5" />
          </div>
          <span className="font-serif text-lg font-medium italic">Art Director</span>
        </div>

        <button
          onClick={() => setHistoryOpen(true)}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border border-[#E2DACD] hover:bg-[#EFE9DF] transition-colors"
        >
          <History className="w-3.5 h-3.5 text-[#B85D19]" />
          Archive ({savedSessions.length})
        </button>
      </header>

      {/* History Slide-out Drawer */}
      {historyOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-start">
          <div className="w-full max-w-sm bg-[#F9F6F0] h-full shadow-2xl p-6 flex flex-col justify-between border-r border-[#E2DACD] animate-in slide-in-from-left duration-200">
            <div>
              <div className="flex items-center justify-between border-b border-[#E2DACD] pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-[#B85D19]" />
                  <h3 className="font-serif text-xl font-medium">Session Archive</h3>
                </div>
                <button onClick={() => setHistoryOpen(false)} className="p-1 hover:bg-[#EFE9DF] rounded-full">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {savedSessions.length === 0 ? (
                <p className="text-xs text-[#121212]/50 text-center py-12">No archived sessions. Generated visual suites are preserved here automatically.</p>
              ) : (
                <div className="space-y-3 overflow-y-auto max-h-[75vh] pr-1">
                  {savedSessions.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => loadPastSession(s)}
                      className="p-3.5 rounded-2xl bg-white border border-[#E2DACD] hover:border-[#B85D19] cursor-pointer transition-all flex justify-between items-start group shadow-sm"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#B85D19]">{s.personality}</span>
                          <span className="text-[10px] text-[#121212]/40 font-mono">{s.date}</span>
                        </div>
                        <h4 className="font-medium text-xs line-clamp-1">{s.brandDesc}</h4>
                        <span className="text-[11px] text-[#121212]/60">Concept {s.selectedConcept.toUpperCase()}</span>
                      </div>
                      <button
                        onClick={(e) => deleteSession(s.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-600 transition-opacity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="text-[11px] text-[#121212]/50 text-center pt-4 border-t border-[#E2DACD]">
              Locally persisted in browser sandbox.
            </div>
          </div>
          <div className="flex-1" onClick={() => setHistoryOpen(false)} />
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 w-full max-w-4xl mx-auto p-6 pb-40 flex flex-col gap-8">
        
        {/* Timeline Messages */}
        {messages.map((msg, index) => (
          <div key={index} className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" ? (
              <div className="flex gap-4 max-w-[85%]">
                <div className="w-8 h-8 rounded-full bg-[#121212] flex items-center justify-center shrink-0 mt-0.5 text-[#F9F6F0]">
                  <Palette className="w-4 h-4 stroke-[1.75]" />
                </div>
                <div className="text-xl leading-relaxed tracking-tight font-serif text-[#121212]">
                  {msg.content}
                </div>
              </div>
            ) : (
              <div className="flex gap-4 max-w-[85%] flex-row-reverse">
                <div className="w-8 h-8 rounded-full bg-[#EFE9DF] border border-[#E2DACD] flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4 text-[#121212]" />
                </div>
                <div className="text-base leading-relaxed bg-[#121212] text-[#F9F6F0] px-6 py-4 rounded-3xl rounded-tr-sm font-light">
                  {msg.content}
                </div>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 items-center text-[#121212]/60 ml-2 text-xs uppercase tracking-widest font-semibold">
            <Loader2 className="w-4 h-4 animate-spin text-[#B85D19]" />
            Evaluating brand parameters...
          </div>
        )}

        {/* Emotion Pillar Selectors */}
        {showCards && (
          <div className="ml-12 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {EMOTIONS.map((emotion) => {
              const isSelected = selectedEmotions.includes(emotion.id);
              return (
                <button
                  key={emotion.id}
                  onClick={() => toggleEmotion(emotion.id)}
                  type="button"
                  className={`px-4 py-3.5 rounded-2xl border text-sm font-medium transition-all ${
                    isSelected 
                      ? "border-[#121212] bg-[#121212] text-[#F9F6F0]" 
                      : "border-[#E2DACD] bg-white hover:border-[#B85D19]"
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
                  className="flex items-center gap-2 bg-[#B85D19] text-white px-6 py-3 rounded-full text-xs uppercase tracking-widest font-semibold hover:bg-[#964a12] transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  Synthesize Mood DNA
                </button>
              </div>
            )}
          </div>
        )}

        {generatingDna && (
          <div className="p-8 rounded-3xl bg-white border border-[#E2DACD] flex flex-col items-center justify-center gap-3 text-center my-4">
            <Loader2 className="w-6 h-6 animate-spin text-[#B85D19]" />
            <div>
              <h3 className="font-serif text-lg font-medium">Synthesizing Mood DNA & Concept Battler</h3>
              <p className="text-xs text-[#121212]/60 mt-0.5">Extracting visual archetypes and challenging surface-level clichés...</p>
            </div>
          </div>
        )}

        {/* Mood DNA Display */}
        {brandData && brandData.dna && (
          <div className="space-y-12">
            <div className="border-t border-[#E2DACD] pt-10">
              <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#B85D19]">Strategic Framework</span>
              <h2 className="text-3xl font-serif font-medium tracking-tight mt-1">Brand's Mood DNA</h2>
              <p className="text-xs text-[#121212]/60 mt-1">Archetype Profile: <span className="font-semibold text-[#121212]">{brandData.personality}</span></p>
            </div>

            {/* Metric Meters */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-[#E2DACD] space-y-4 shadow-sm">
              {Object.entries(brandData.dna).map(([trait, score]) => (
                <div key={trait} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold uppercase tracking-wider">
                    <span>{trait}</span>
                    <span className="font-mono">{score}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#EFE9DF] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#121212] rounded-full transition-all duration-1000" 
                      style={{ width: `${score}%` }} 
                    />
                  </div>
                </div>
              ))}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[#E2DACD]">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#B85D19]">Embrace (Keywords)</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {brandData.keywords.map((kw, i) => (
                      <span key={i} className="text-xs px-3 py-1 rounded-full bg-[#EFE9DF] font-medium">{kw}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-red-700">Avoid (Clichés)</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {brandData.avoid.map((av, i) => (
                      <span key={i} className="text-xs px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 font-medium line-through">{av}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Concept Battler */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Swords className="w-5 h-5 text-[#B85D19]" />
                <h2 className="text-2xl font-serif font-medium tracking-tight">Concept Battle: Select Trajectory</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {brandData.concepts.map((concept) => {
                  const isChosen = selectedConcept === concept.id;
                  return (
                    <div 
                      key={concept.id}
                      onClick={() => setSelectedConcept(concept.id)}
                      className={`cursor-pointer rounded-3xl p-6 flex flex-col justify-between transition-all border ${
                        isChosen
                          ? "bg-[#121212] text-[#F9F6F0] border-[#121212] scale-[1.02] shadow-xl"
                          : "bg-white text-[#121212] border-[#E2DACD] hover:border-[#B85D19]"
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                            isChosen ? "bg-[#B85D19] text-white" : "bg-[#EFE9DF] text-[#121212]"
                          }`}>
                            Concept {concept.id.toUpperCase()}
                          </span>
                          <span className="text-[11px] opacity-60 font-medium">{concept.style}</span>
                        </div>

                        <h3 className="font-serif text-2xl font-medium">{concept.title}</h3>
                        <p className={`text-xs italic ${isChosen ? "text-[#EFE9DF]" : "text-[#121212]/70"}`}>
                          "{concept.tagline}"
                        </p>
                        <p className="text-xs leading-relaxed opacity-80 font-light">{concept.description}</p>
                      </div>

                      <div className={`mt-6 p-4 rounded-2xl border text-xs space-y-1 ${
                        isChosen 
                          ? "bg-white/10 border-white/20 text-[#F9F6F0]" 
                          : "bg-[#F9F6F0] border-[#E2DACD] text-[#121212]/80"
                      }`}>
                        <div className="flex items-center gap-1.5 font-semibold text-[11px]">
                          <AlertTriangle className="w-3 h-3 text-[#B85D19]" />
                          <span>Devil's Advocate</span>
                        </div>
                        <p className="leading-snug text-[11px] opacity-90">{concept.devilsAdvocate}</p>
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
                    className="bg-[#B85D19] text-white px-8 py-4 rounded-full text-xs uppercase tracking-widest font-semibold shadow-lg hover:bg-[#964a12] transition-all flex items-center gap-2"
                  >
                    {studioLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Synthesizing Studio Assets...
                      </>
                    ) : (
                      <>Assemble Brand Suite: Concept {selectedConcept.toUpperCase()} →</>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Production Studio */}
            {studioData && (
              <div className="space-y-10 border-t border-[#E2DACD] pt-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#B85D19]">Production Kit</span>
                    <h2 className="text-3xl font-serif font-medium tracking-tight">Art Director's Execution Suite</h2>
                  </div>
                  <button
                    onClick={exportBrief}
                    className="flex items-center gap-2 bg-[#121212] text-[#F9F6F0] px-5 py-3 rounded-full text-xs uppercase tracking-wider font-semibold hover:bg-black transition-colors self-start"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download Kit (.md)
                  </button>
                </div>

                {/* AI Editorial Lookbook Visualizer with Prompt Refinement */}
                <div className="bg-white p-6 md:p-8 rounded-3xl border border-[#E2DACD] space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-[#B85D19]" />
                      <h3 className="font-serif text-xl font-medium">Editorial Lookbook Preview</h3>
                    </div>
                    <button
                      onClick={() => triggerFluxRender(activePrompt)}
                      disabled={imageLoading}
                      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 border border-[#E2DACD] rounded-full hover:bg-[#EFE9DF] transition-colors"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${imageLoading ? 'animate-spin' : ''}`} />
                      Re-render
                    </button>
                  </div>

                  {imageLoading ? (
                    <div className="w-full h-80 rounded-2xl bg-[#F9F6F0] flex flex-col items-center justify-center gap-2 border border-dashed border-[#E2DACD]">
                      <Loader2 className="w-6 h-6 animate-spin text-[#B85D19]" />
                      <span className="text-xs text-[#121212]/60 font-medium">Synthesizing photograph via Flux...</span>
                    </div>
                  ) : imageUrl ? (
                    <div className="relative rounded-2xl overflow-hidden border border-[#E2DACD] shadow-sm">
                      <img 
                        src={imageUrl} 
                        alt="Editorial Photography" 
                        className="w-full h-auto max-h-[500px] object-cover"
                      />
                      <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/80 to-transparent text-white text-[11px] font-mono">
                        Rendered with Flux.1 Precision Architecture
                      </div>
                    </div>
                  ) : null}

                  {/* Inline Prompt Editor for fine-tuning image outcomes */}
                  <div className="pt-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#121212]/60 flex items-center gap-1.5">
                        <Edit3 className="w-3 h-3" />
                        Prompt Directives
                      </span>
                      <button 
                        onClick={copyHeroPrompt} 
                        className="text-[11px] font-semibold text-[#B85D19] hover:underline flex items-center gap-1"
                      >
                        {copiedPrompt ? "Copied to clipboard" : "Copy prompt"}
                      </button>
                    </div>
                    <textarea 
                      value={activePrompt}
                      onChange={(e) => setActivePrompt(e.target.value)}
                      rows={3}
                      className="w-full p-3 text-xs bg-[#F9F6F0] border border-[#E2DACD] rounded-xl font-mono focus:outline-none focus:border-[#B85D19] leading-relaxed resize-none"
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={() => triggerFluxRender(activePrompt)}
                        disabled={imageLoading}
                        className="bg-[#121212] text-[#F9F6F0] text-xs px-4 py-2 rounded-full font-medium hover:bg-[#B85D19] transition-colors"
                      >
                        Generate with Edited Prompt
                      </button>
                    </div>
                  </div>
                </div>

                {/* Color Palette Swatches */}
                <div className="bg-white p-6 md:p-8 rounded-3xl border border-[#E2DACD] space-y-6">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-[#B85D19]" />
                    <h3 className="font-serif text-xl font-medium">Curated Color System</h3>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {studioData.colors.map((c, i) => (
                      <div key={i} className="flex flex-col gap-2 p-3 rounded-2xl border border-[#E2DACD] bg-[#F9F6F0]/40">
                        <div 
                          className="h-20 w-full rounded-xl shadow-inner border border-black/5" 
                          style={{ backgroundColor: c.hex }} 
                        />
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#121212]/50 block">{c.role}</span>
                          <span className="font-semibold text-xs block">{c.name}</span>
                          <code className="text-[11px] bg-[#EFE9DF] px-1.5 py-0.5 rounded font-mono mt-1 inline-block">{c.hex}</code>
                        </div>
                        <p className="text-[11px] text-[#121212]/70 leading-relaxed mt-1">{c.usage}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Typography System */}
                <div className="bg-white p-6 md:p-8 rounded-3xl border border-[#E2DACD] space-y-6">
                  <div className="flex items-center gap-2">
                    <Type className="w-4 h-4 text-[#B85D19]" />
                    <h3 className="font-serif text-xl font-medium">Typographic Scale</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-5 rounded-2xl border border-[#E2DACD] bg-[#F9F6F0]/50">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#B85D19]">Display & Title Hierarchy</span>
                      <h4 className="text-2xl font-serif font-bold mt-2">{studioData.typography.heading.font}</h4>
                      <p className="text-xs text-[#121212]/60 mt-1 font-light">{studioData.typography.heading.style}</p>
                    </div>

                    <div className="p-5 rounded-2xl border border-[#E2DACD] bg-[#F9F6F0]/50">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#B85D19]">Interface & Body</span>
                      <h4 className="text-xl font-sans font-medium mt-2">{studioData.typography.body.font}</h4>
                      <p className="text-xs text-[#121212]/60 mt-1 font-light">{studioData.typography.body.style}</p>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* Discovery Input Bar */}
      {!brandData && (
        <div className="fixed bottom-0 left-0 w-full bg-gradient-to-t from-[#F9F6F0] via-[#F9F6F0] to-transparent pt-10 pb-8 px-6 z-10">
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
                    ? "Art Director is evaluating..." 
                    : showCards 
                    ? "Select aesthetic pillars above..." 
                    : "e.g. Minimalist modular furniture tailored for compact studios..."
                }
                className="w-full bg-white border border-[#E2DACD] rounded-full pl-6 pr-14 py-4 text-base focus:outline-none focus:border-[#B85D19] shadow-sm transition-colors disabled:opacity-50 font-light"
              />
              <button 
                type="button"
                onClick={handleSend}
                disabled={!input.trim() || showCards || loading || generatingDna}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#121212] text-[#F9F6F0] rounded-full flex items-center justify-center hover:bg-[#B85D19] disabled:opacity-50 transition-all"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}