"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Palette, User, ArrowLeft, Check, Loader2, 
  Swords, Type, Download, History, X, 
  Image as ImageIcon, RefreshCw, Trash2, Send, Bookmark
} from "lucide-react";
import Link from "next/link";

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
  messages: { role: string; content: string }[];
}

// Mathematical luminance calculation for WCAG contrast guarantees
function getReadableTextColor(bgHex: string) {
  const cleanHex = bgHex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2) || "255", 16);
  const g = parseInt(cleanHex.substring(2, 4) || "255", 16);
  const b = parseInt(cleanHex.substring(4, 6) || "255", 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? '#121212' : '#FFFFFF';
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

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<{ role: string; content: string }[]>([
    {
      role: "assistant",
      content: "Let us define your visual landscape. Describe your brand, product, and audience in your own words.",
    }
  ]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("art_director_history");
      if (stored) setSavedSessions(JSON.parse(stored));
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 150);
    return () => clearTimeout(timer);
  }, [messages, showCards, loading, brandData, generatingDna, studioData, imageUrl]);

  const saveCurrentToHistory = (latestStudio: StudioData, activeMessages: { role: string; content: string }[]) => {
    if (!brandData || !selectedConcept) return;

    const newRecord: SavedSession = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
      brandDesc,
      personality: brandData.personality,
      selectedConcept,
      brandData,
      studioData: latestStudio,
      imageUrl: imageUrl || undefined,
      messages: activeMessages,
    };

    setSavedSessions((prev) => {
      const filtered = prev.filter(p => p.brandDesc !== brandDesc);
      const updated = [newRecord, ...filtered.slice(0, 19)];
      localStorage.setItem("art_director_history", JSON.stringify(updated));
      return updated;
    });
  };

  const loadPastSession = (s: SavedSession) => {
    setBrandDesc(s.brandDesc);
    setBrandData(s.brandData);
    setSelectedConcept(s.selectedConcept);
    setStudioData(s.studioData);
    setImageUrl(s.imageUrl || null);
    if (s.messages && s.messages.length > 0) {
      setMessages(s.messages);
    }
    setHistoryOpen(false);
  };

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedSessions((prev) => {
      const filtered = prev.filter(item => item.id !== id);
      localStorage.setItem("art_director_history", JSON.stringify(filtered));
      return filtered;
    });
  };

  const handleSend = async (e?: React.FormEvent | React.MouseEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading || generatingDna || studioLoading) return;

    const userText = input.trim();
    setInput("");

    const updatedMessages = [...messages, { role: "user", content: userText }];
    setMessages(updatedMessages);
    setLoading(true);

    if (!brandData) {
      setBrandDesc(userText);
      try {
        const res = await fetch("/api/discovery", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userMessage: userText }),
        });
        const data = await res.json();
        if (data.reply) {
          setMessages([...updatedMessages, { role: "assistant", content: data.reply }]);
          setShowCards(true);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      const activeConceptObj = brandData.concepts.find(c => c.id === selectedConcept);
      const res = await fetch("/api/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userFeedback: userText,
          brandDescription: brandDesc,
          currentStudioData: studioData,
          currentConcept: activeConceptObj,
        }),
      });

      const data = await res.json();
      if (data.updatedStudio) {
        setStudioData(data.updatedStudio);
        const finalMessages = [
          ...updatedMessages,
          { role: "assistant", content: `${data.assistantReply} What additional changes or details would you like to explore?` }
        ];
        setMessages(finalMessages);
        triggerFluxRender(data.updatedStudio.heroPrompt, brandDesc, data.updatedStudio.colors);
        saveCurrentToHistory(data.updatedStudio, finalMessages);
      }
    } catch (err) {
      console.error(err);
      setMessages([
        ...updatedMessages,
        { role: "assistant", content: "I encountered an issue processing your request. Please try stating what you'd like adjusted." }
      ]);
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
      
    const newMsgThread = [...messages, { role: "user", content: `Aesthetic Pillars: ${emotionLabels}` }];
    setMessages(newMsgThread);
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
        setMessages([
          ...newMsgThread,
          { role: "assistant", content: "I calculated your Mood DNA and formulated 3 contrasting strategic trajectories. Select your preferred concept below to assemble the design kit." }
        ]);
      }
    } catch (err) {
      console.error(err);
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
        triggerFluxRender(data.heroPrompt, brandDesc, data.colors);
        const finalMessages = [
          ...messages,
          { 
            role: "assistant", 
            content: `The brand suite for Concept ${selectedConcept.toUpperCase()} is assembled. Review the live collateral billboard, color palette, and typography pairing below. Share your thoughts or request specific tweaks right here.` 
          }
        ];
        setMessages(finalMessages);
        saveCurrentToHistory(data, finalMessages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setStudioLoading(false);
    }
  };

  const triggerFluxRender = (promptText: string, subject: string, colorsList?: any[]) => {
    setImageLoading(true);
    const primaryColor = colorsList?.[2]?.name || "focal";
    const baseColor = colorsList?.[0]?.name || "base";

    const cleanPrompt = encodeURIComponent(
      `commercial editorial product photograph of ${subject}, featuring ${primaryColor} and ${baseColor} materials, tactile textures, professional studio lighting, 8k resolution, photorealistic, centered composition, no text, no blur`
    );

    const seed = Math.floor(Math.random() * 900000 + 100000);
    const url = `https://image.pollinations.ai/prompt/${cleanPrompt}?width=1200&height=800&model=flux&seed=${seed}&nologo=true`;

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

  // Safe contrast calculations for live billboard preview
  const canvasBg = studioData?.colors?.[1]?.hex || "#FFFFFF";
  const canvasText = getReadableTextColor(canvasBg);
  const heroBadgeBg = studioData?.colors?.[2]?.hex || "#B85D19";
  const heroBadgeText = getReadableTextColor(heroBadgeBg);
  const primaryBtnBg = studioData?.colors?.[0]?.hex || "#121212";
  const primaryBtnText = getReadableTextColor(primaryBtnBg);

  return (
    <div className="flex flex-col min-h-screen bg-[#F9F6F0] text-[#121212] selection:bg-[#B85D19] selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-[#F9F6F0]/85 backdrop-blur-md border-b border-[#E2DACD]">
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
                  <Bookmark className="w-4 h-4 text-[#B85D19]" />
                  <h3 className="font-serif text-xl font-medium">Archived Sessions</h3>
                </div>
                <button onClick={() => setHistoryOpen(false)} className="p-1 hover:bg-[#EFE9DF] rounded-full">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {savedSessions.length === 0 ? (
                <p className="text-xs text-[#121212]/50 text-center py-12">No saved brand sessions yet.</p>
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
                        <span className="text-[11px] text-[#121212]/60">Concept {s.selectedConcept?.toUpperCase()}</span>
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
              Locally persisted in browser storage.
            </div>
          </div>
          <div className="flex-1" onClick={() => setHistoryOpen(false)} />
        </div>
      )}

      {/* Main Stream */}
      <main className="flex-1 w-full max-w-4xl mx-auto p-6 pb-48 flex flex-col gap-6">
        
        {/* Chat Timeline */}
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`flex w-full animate-in fade-in slide-in-from-bottom-2 duration-300 ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.role === "assistant" ? (
              <div className="flex gap-4 max-w-[85%]">
                <div className="w-8 h-8 rounded-full bg-[#121212] flex items-center justify-center shrink-0 mt-0.5 text-[#F9F6F0]">
                  <Palette className="w-4 h-4 stroke-[1.75]" />
                </div>
                <div className="text-lg leading-relaxed font-serif text-[#121212]">
                  {msg.content}
                </div>
              </div>
            ) : (
              <div className="flex gap-4 max-w-[85%] flex-row-reverse">
                <div className="w-8 h-8 rounded-full bg-[#EFE9DF] border border-[#E2DACD] flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4 text-[#121212]" />
                </div>
                <div className="text-base leading-relaxed bg-[#121212] text-[#F9F6F0] px-6 py-3.5 rounded-3xl rounded-tr-sm font-light">
                  {msg.content}
                </div>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 items-center text-[#121212]/60 ml-2 text-xs uppercase tracking-widest font-semibold animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin text-[#B85D19]" />
            Art Director is recalibrating your vision...
          </div>
        )}

        {/* Emotion Pills */}
        {showCards && (
          <div className="ml-12 grid grid-cols-2 sm:grid-cols-3 gap-3 animate-in fade-in duration-300">
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

        {/* Concept Battler */}
        {brandData && !studioData && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center gap-2">
              <Swords className="w-5 h-5 text-[#B85D19]" />
              <h2 className="text-2xl font-serif font-medium tracking-tight">Select Creative Concept</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {brandData.concepts.map((concept) => {
                const isChosen = selectedConcept === concept.id;
                return (
                  <div 
                    key={concept.id}
                    onClick={() => setSelectedConcept(concept.id)}
                    className={`cursor-pointer rounded-3xl p-5 flex flex-col justify-between transition-all border ${
                      isChosen
                        ? "bg-[#121212] text-[#F9F6F0] border-[#121212] shadow-lg scale-[1.01]"
                        : "bg-white text-[#121212] border-[#E2DACD] hover:border-[#B85D19]"
                    }`}
                  >
                    <div className="space-y-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        isChosen ? "bg-[#B85D19] text-white" : "bg-[#EFE9DF] text-[#121212]"
                      }`}>
                        Concept {concept.id.toUpperCase()}
                      </span>
                      <h3 className="font-serif text-xl font-medium">{concept.title}</h3>
                      <p className="text-xs opacity-75 font-light">{concept.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedConcept && (
              <div className="flex justify-center pt-2">
                <button 
                  onClick={generateStudio}
                  disabled={studioLoading}
                  className="bg-[#B85D19] text-white px-8 py-3.5 rounded-full text-xs uppercase tracking-widest font-semibold hover:bg-[#964a12] transition-all flex items-center gap-2"
                >
                  {studioLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Build Visual Identity Studio →"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Visual Studio Suite */}
        {studioData && (
          <div className="space-y-8 animate-in fade-in duration-500">
            
            {/* High-Contrast Dynamic Collateral Billboard */}
            <div 
              className="rounded-3xl p-8 border-2 shadow-xl relative overflow-hidden transition-all duration-500 flex flex-col justify-between min-h-[380px]"
              style={{ 
                backgroundColor: canvasBg,
                borderColor: primaryBtnBg,
                color: canvasText
              }}
            >
              <div className="flex justify-between items-start border-b pb-4" style={{ borderColor: `${primaryBtnBg}25` }}>
                <div className="flex items-center gap-2">
                  <span 
                    className="text-[11px] uppercase tracking-widest px-3 py-1 rounded-full font-bold shadow-sm"
                    style={{ 
                      backgroundColor: heroBadgeBg, 
                      color: heroBadgeText 
                    }}
                  >
                    Live Mockup Proof
                  </span>
                  <span className="text-xs font-mono uppercase font-semibold opacity-75">
                    {studioData.typography?.heading?.font}
                  </span>
                </div>
                <span className="text-xs font-bold tracking-wider uppercase opacity-60">Identity System</span>
              </div>

              <div className="my-8 space-y-4">
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-none capitalize">
                  {brandDesc}
                </h1>
                <p className="text-base md:text-lg max-w-2xl font-medium leading-relaxed opacity-90">
                  {studioData.creativeBrief?.coreThesis || "A distinctive visual identity built on deliberate hierarchy and craft."}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-4 border-t" style={{ borderColor: `${primaryBtnBg}25` }}>
                <button 
                  className="px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider shadow-md transition-transform active:scale-95"
                  style={{ 
                    backgroundColor: primaryBtnBg, 
                    color: primaryBtnText 
                  }}
                >
                  Explore Collection
                </button>
                <button 
                  className="px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider border-2 transition-transform active:scale-95"
                  style={{ 
                    borderColor: primaryBtnBg,
                    color: canvasText
                  }}
                >
                  View Specifications
                </button>
              </div>
            </div>

            {/* Lookbook & Color System */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Photo */}
              <div className="bg-white p-5 rounded-3xl border border-[#E2DACD] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-[#B85D19]">
                    <ImageIcon className="w-3.5 h-3.5" /> Lookbook Visual
                  </span>
                  <button 
                    onClick={() => triggerFluxRender(studioData.heroPrompt, brandDesc, studioData.colors)}
                    className="p-1 hover:bg-[#EFE9DF] rounded-full"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${imageLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
                {imageLoading ? (
                  <div className="h-64 rounded-2xl bg-[#F9F6F0] flex flex-col items-center justify-center gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-[#B85D19]" />
                    <span className="text-xs text-[#121212]/50">Synthesizing photographic lookbook...</span>
                  </div>
                ) : imageUrl ? (
                  <img src={imageUrl} alt="Lookbook" className="w-full h-64 object-cover rounded-2xl shadow-sm" />
                ) : null}
              </div>

              {/* Color Palette */}
              <div className="bg-white p-5 rounded-3xl border border-[#E2DACD] flex flex-col justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#B85D19] mb-3 block">
                  Curated Color Palette
                </span>
                <div className="grid grid-cols-2 gap-3 flex-1">
                  {studioData.colors.map((c, i) => (
                    <div key={i} className="p-3 rounded-2xl border border-[#E2DACD] bg-[#F9F6F0]/40 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl shadow-inner border border-black/10 shrink-0" style={{ backgroundColor: c.hex }} />
                      <div className="overflow-hidden">
                        <span className="text-xs font-bold block truncate text-[#121212]">{c.name}</span>
                        <code className="text-[11px] text-[#121212]/70 font-mono font-semibold block">{c.hex}</code>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Typography Scale */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-[#E2DACD] space-y-4">
              <div className="flex items-center gap-2">
                <Type className="w-4 h-4 text-[#B85D19]" />
                <h3 className="font-serif text-xl font-medium">Typographic Scale & Pairings</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="p-5 rounded-2xl border border-[#E2DACD] bg-[#F9F6F0]/60 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#B85D19]">Display & Title Hierarchy</span>
                  <h4 className="text-2xl font-serif font-bold pt-1 text-[#121212]">
                    {studioData.typography?.heading?.font || "Cabinet Grotesk"}
                  </h4>
                  <p className="text-xs text-[#121212]/80 font-medium">
                    {studioData.typography?.heading?.style || "Tight tracking, optical kerning, bold impact"}
                  </p>
                </div>

                <div className="p-5 rounded-2xl border border-[#E2DACD] bg-[#F9F6F0]/60 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#B85D19]">Interface & Body</span>
                  <h4 className="text-xl font-sans font-semibold pt-1 text-[#121212]">
                    {studioData.typography?.body?.font || "General Sans"}
                  </h4>
                  <p className="text-xs text-[#121212]/80 font-medium">
                    {studioData.typography?.body?.style || "Neutral geometric clarity, comfortable line height"}
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* Input Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-gradient-to-t from-[#F9F6F0] via-[#F9F6F0] to-transparent pt-6 pb-6 px-6 z-20">
        <div className="max-w-3xl mx-auto relative">
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={showCards || loading || generatingDna || studioLoading}
              placeholder={
                studioData 
                  ? "Critique or refine (e.g. 'Shift palette to darker earth tones and make the display font more geometric')..." 
                  : showCards 
                  ? "Select aesthetic pillars above..." 
                  : "Describe any brand, product, or event..."
              }
              className="w-full bg-white border border-[#E2DACD] rounded-full pl-6 pr-14 py-4 text-sm focus:outline-none focus:border-[#B85D19] shadow-sm transition-all duration-200 disabled:opacity-50"
            />
            <button 
              type="button"
              onClick={handleSend}
              disabled={!input.trim() || showCards || loading || generatingDna || studioLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#121212] text-[#F9F6F0] rounded-full flex items-center justify-center hover:bg-[#B85D19] disabled:opacity-50 transition-all duration-200"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}