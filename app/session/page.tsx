"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Palette, User, ArrowLeft, Check, Loader2, 
  Swords, Type, History, X, 
  RefreshCw, Trash2, Send, Bookmark, Lock, Unlock, Sliders, Copy
} from "lucide-react";
import Link from "next/link";
import { 
  generateGoogleFontUrl, 
  getFontjoyGeneration, 
  FontjoySystem,
} from "@/lib/fontEngine";
import { fetchHuemintCustom } from "@/lib/huemint";
import Image from "next/image";

function InstagramIcon({ className = "w-4 h-4 text-[#B85D19]" }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  );
}

interface EmotionOption {
  id: string;
  label: string;
}

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
    subhead?: { font: string; style: string };
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
  const [emotionOptions, setEmotionOptions] = useState<EmotionOption[]>([]);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [brandDesc, setBrandDesc] = useState("");
  const [brandData, setBrandData] = useState<BrandData | null>(null);
  const [generatingDna, setGeneratingDna] = useState(false);
  const [selectedConcept, setSelectedConcept] = useState<string | null>(null);
  const [studioLoading, setStudioLoading] = useState(false);
  const [studioData, setStudioData] = useState<StudioData | null>(null);

  // Huemint Interactive Controls
  const [lockedColors, setLockedColors] = useState<boolean[]>([false, false, false, false]);
  const [huemintTemp, setHuemintTemp] = useState<number>(1.2);
  const [huemintLoading, setHuemintLoading] = useState<boolean>(false);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  // Fontjoy Interactive Controls
  const [lockedFonts, setLockedFonts] = useState({ heading: false, subhead: false, body: false });
  const [fontContrast, setFontContrast] = useState<"high" | "balanced" | "similar">("high");

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const latestMsgRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<{ role: string; content: string }[]>([
    {
      role: "assistant",
      content: "Let us define your visual landscape. Describe your brand, product, and audience in your own words.",
    }
  ]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const stored = localStorage.getItem("art_director_history");
        if (stored) setSavedSessions(JSON.parse(stored));
      } catch {
        // Ignore malformed local history and keep the empty archive.
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        latestMsgRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        latestMsgRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }, 120);
    return () => clearTimeout(timer);
  }, [messages.length, loading]);

  // Google Font Link Injection
  useEffect(() => {
    if (!studioData?.typography) return;
    const h = studioData.typography.heading.font;
    const s = studioData.typography.subhead?.font || "Plus Jakarta Sans";
    const b = studioData.typography.body.font;
    const fontUrl = generateGoogleFontUrl(h, s, b);

    const linkId = "dynamic-google-fonts";
    let link = document.getElementById(linkId) as HTMLLinkElement;
    if (!link) {
      link = document.createElement("link");
      link.id = linkId;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    link.href = fontUrl;
  }, [studioData?.typography]);

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

  // --- HUEMINT GENERATOR WORKBENCH ---
  const rollHuemintColors = async () => {
    if (!studioData || huemintLoading) return;
    setHuemintLoading(true);

    const currentHexes = studioData.colors.map(c => c.hex);
    const newHexes = await fetchHuemintCustom(currentHexes, lockedColors, huemintTemp);

    if (newHexes && newHexes.length === 4) {
      const updatedColors = studioData.colors.map((c, i) => ({
        ...c,
        hex: lockedColors[i] ? c.hex : newHexes[i]
      }));

      const updatedStudio: StudioData = {
        ...studioData,
        colors: updatedColors
      };

      setStudioData(updatedStudio);
      saveCurrentToHistory(updatedStudio, messages);
    }
    setHuemintLoading(false);
  };

  const toggleColorLock = (index: number) => {
    setLockedColors(prev => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  const handleManualColorChange = (index: number, newHex: string) => {
    if (!studioData) return;
    const updatedColors = [...studioData.colors];
    updatedColors[index] = { ...updatedColors[index], hex: newHex };

    const updatedStudio = { ...studioData, colors: updatedColors };
    setStudioData(updatedStudio);
    saveCurrentToHistory(updatedStudio, messages);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHex(text);
    setTimeout(() => setCopiedHex(null), 1500);
  };

  // --- FONTJOY GENERATOR WORKBENCH ---
  const rollFontjoyFonts = () => {
    if (!studioData) return;

    const currentSystem: FontjoySystem = {
      heading: { font: studioData.typography.heading.font, style: studioData.typography.heading.style, category: "display" },
      subhead: { font: studioData.typography.subhead?.font || "Plus Jakarta Sans", style: studioData.typography.subhead?.style || "Semi-bold", category: "sans" },
      body: { font: studioData.typography.body.font, style: studioData.typography.body.style, category: "sans" }
    };

    const nextSystem = getFontjoyGeneration(currentSystem, lockedFonts, fontContrast);

    const updatedStudio: StudioData = {
      ...studioData,
      typography: {
        heading: { font: nextSystem.heading.font, style: nextSystem.heading.style },
        subhead: { font: nextSystem.subhead.font, style: nextSystem.subhead.style },
        body: { font: nextSystem.body.font, style: nextSystem.body.style }
      }
    };

    setStudioData(updatedStudio);
    saveCurrentToHistory(updatedStudio, messages);
  };

  const handleSend = async (
    e?: React.FormEvent | React.MouseEvent | React.KeyboardEvent,
    customText?: string
  ) => {
    if (e) e.preventDefault();
    const userText = (customText || input).trim();
    if (!userText || loading || generatingDna || studioLoading) return;

    if (!customText) setInput("");

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
          if (Array.isArray(data.options) && data.options.length > 0) {
            setEmotionOptions(data.options);
          }
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
        await new Promise((resolve) => setTimeout(resolve, 350));

        setStudioData(data.updatedStudio);
        const finalMessages = [
          ...updatedMessages,
          { role: "assistant", content: `${data.assistantReply} What additional adjustments would you like to explore?` }
        ];
        setMessages(finalMessages);
        triggerFluxRender(
          data.updatedStudio.heroPrompt,
          brandDesc,
          data.updatedStudio.colors,
          data.updatedStudio.typography?.heading?.font,
          data.updatedStudio.typography?.body?.font,
          activeConcept?.style
        );
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
      .map(id => emotionOptions.find(e => e.id === id)?.label)
      .filter(Boolean)
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
          emotions: selectedEmotions
            .map(id => emotionOptions.find(e => e.id === id)?.label)
            .filter(Boolean),
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
        triggerFluxRender(
          data.heroPrompt,
          brandDesc,
          data.colors,
          data.typography?.heading?.font,
          data.typography?.body?.font,
          conceptObj.style
        );
        const finalMessages = [
          ...messages,
          { 
            role: "assistant", 
            content: `The design system for Concept ${selectedConcept.toUpperCase()} is assembled. You can now use the Huemint-style palette workspace and Fontjoy typographic generator below.` 
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

  const triggerFluxRender = async (
    promptText: string,
    subject: string,
    colorsList?: StudioData["colors"],
    headingFont?: string,
    bodyFont?: string,
    conceptStyle?: string
  ) => {
    setImageLoading(true);
    const primaryColor = colorsList?.[2]?.name || "vibrant";
    const baseColor = colorsList?.[0]?.name || "neutral";

    try {
      const res = await fetch("/api/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptText,
          brandName: subject,
          primaryColor,
          baseColor,
          headingFont: headingFont || "modern typeface",
          bodyFont: bodyFont || "clean sans serif",
          conceptStyle: conceptStyle || "editorial brand direction"
        }),
      });

      const data = await res.json();

      if (data.imageUrl) {
        setImageUrl(data.imageUrl);
      } else {
        const seed = Math.floor(Math.random() * 900000 + 100000);
        const encoded = encodeURIComponent(`Instagram feed post mockup for ${subject}, featuring ${primaryColor} packaging, Behance award winning branding design, 8k, photorealistic`);
        setImageUrl(`https://image.pollinations.ai/prompt/${encoded}?width=1080&height=1080&model=flux&seed=${seed}&nologo=true`);
      }
    } catch (err) {
      console.error("Image generation error:", err);
    } finally {
      setImageLoading(false);
    }
  };

  const canvasBg = studioData?.colors?.[1]?.hex || "#FFFFFF";
  const canvasText = getReadableTextColor(canvasBg);
  const heroBadgeBg = studioData?.colors?.[2]?.hex || "#B85D19";
  const heroBadgeText = getReadableTextColor(heroBadgeBg);
  const primaryBtnBg = studioData?.colors?.[0]?.hex || "#121212";
  const primaryBtnText = getReadableTextColor(primaryBtnBg);

  const headingFontName = studioData?.typography?.heading?.font?.split('/')[0].trim() || 'serif';
  const subheadFontName = studioData?.typography?.subhead?.font?.split('/')[0].trim() || 'sans-serif';
  const bodyFontName = studioData?.typography?.body?.font?.split('/')[0].trim() || 'sans-serif';
  const activeConcept = brandData?.concepts.find(c => c.id === selectedConcept);

  return (
    <div className="flex flex-col min-h-screen bg-[#F9F6F0] text-[#121212] selection:bg-[#B85D19] selection:text-white">
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

      <main className="flex-1 w-full max-w-4xl mx-auto p-6 pb-48 flex flex-col gap-6">
        {messages.map((msg, index) => {
          const isLast = index === messages.length - 1;
          return (
            <div 
              key={index} 
              ref={isLast ? latestMsgRef : null}
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
          );
        })}

        {loading && (
          <div className="flex w-full justify-start animate-in fade-in duration-300">
            <div className="flex gap-4 max-w-[85%] items-center">
              <div className="w-8 h-8 rounded-full bg-[#121212] flex items-center justify-center shrink-0 text-[#F9F6F0]">
                <Palette className="w-4 h-4 stroke-[1.75] animate-spin" />
              </div>
              <div className="flex items-center gap-2.5 bg-white border border-[#E2DACD] px-5 py-3 rounded-full text-xs font-medium text-[#121212]/70 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#B85D19] animate-ping" />
                Art Director is synthesizing adjustments...
              </div>
            </div>
          </div>
        )}

        {showCards && (
          <div className="ml-12 grid grid-cols-2 sm:grid-cols-3 gap-3 animate-in fade-in duration-300">
            {emotionOptions.map((emotion) => {
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

        {/* 1. HUEMINT INTERACTIVE COLOR WORKBENCH */}
        {studioData && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-white rounded-3xl border border-[#E2DACD] shadow-sm overflow-hidden flex flex-col">
              
              {/* Huemint Header Controls */}
              <div className="p-6 border-b border-[#E2DACD] flex flex-wrap items-center justify-between gap-4 bg-[#FAF8F5]">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-[#B85D19]" />
                  <h3 className="font-serif text-xl font-medium">Color System </h3>
                </div>

                <div className="flex items-center gap-4">
                  {/* Temperature / Creativity Slider */}
                  <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-[#E2DACD] shadow-xs">
                    <Sliders className="w-3.5 h-3.5 text-[#B85D19]" />
                    <span className="text-[11px] font-semibold text-[#121212]/70">Creativity:</span>
                    <input
                      type="range"
                      min="0.4"
                      max="2.4"
                      step="0.1"
                      value={huemintTemp}
                      onChange={(e) => setHuemintTemp(parseFloat(e.target.value))}
                      className="w-20 accent-[#B85D19] cursor-pointer"
                    />
                    <span className="text-[10px] font-mono text-[#121212]/50">{huemintTemp}</span>
                  </div>

                  {/* Generate / Roll Button */}
                  <button
                    onClick={rollHuemintColors}
                    disabled={huemintLoading}
                    className="flex items-center gap-2 bg-[#121212] text-white px-5 py-2 rounded-full text-xs uppercase tracking-wider font-semibold hover:bg-[#B85D19] transition-all shadow-sm"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${huemintLoading ? 'animate-spin' : ''}`} />
                    Generate
                  </button>
                </div>
              </div>

              {/* Huemint Swatch Columns */}
              <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#E2DACD]">
                {studioData.colors.map((c, i) => {
                  const isLocked = lockedColors[i];
                  const textColor = getReadableTextColor(c.hex);

                  return (
                    <div 
                      key={i} 
                      className="h-64 p-6 flex flex-col justify-between transition-all duration-300 relative group"
                      style={{ backgroundColor: c.hex, color: textColor }}
                    >
                      {/* Top Action Bar (Lock / Color Picker) */}
                      <div className="flex items-center justify-between z-10">
                        <button
                          onClick={() => toggleColorLock(i)}
                          className={`p-2 rounded-full backdrop-blur-md transition-all shadow-xs ${
                            isLocked 
                              ? "bg-white text-[#121212]" 
                              : "bg-black/20 text-white/90 hover:bg-black/40"
                          }`}
                          title={isLocked ? "Unlock color" : "Lock color"}
                        >
                          {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                        </button>

                        <div className="relative overflow-hidden w-7 h-7 rounded-full border border-white/20 shadow-xs cursor-pointer">
                          <input
                            type="color"
                            value={c.hex}
                            onChange={(e) => handleManualColorChange(i, e.target.value)}
                            className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer opacity-0"
                            title="Pick custom hex"
                          />
                          <div className="w-full h-full rounded-full" style={{ backgroundColor: c.hex }} />
                        </div>
                      </div>

                      {/* Swatch Details */}
                      <div className="space-y-1 z-10">
                        <span className="text-[10px] uppercase font-bold tracking-widest opacity-75 block">
                          {c.role}
                        </span>
                        <h4 className="text-lg font-bold tracking-tight line-clamp-1">
                          {c.name}
                        </h4>
                        
                        <div className="flex items-center gap-1.5 pt-1">
                          <button
                            onClick={() => copyToClipboard(c.hex)}
                            className="flex items-center gap-1 text-xs font-mono font-bold px-2 py-1 rounded-md bg-black/15 hover:bg-black/30 backdrop-blur-xs transition-colors"
                          >
                            <Copy className="w-3 h-3" />
                            {copiedHex === c.hex ? "COPIED" : c.hex.toUpperCase()}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

            {/* 2. FONTJOY INTERACTIVE TYPOGRAPHY WORKBENCH */}
            <div className="bg-white rounded-3xl border border-[#E2DACD] shadow-sm p-6 md:p-8 space-y-6">
              
              {/* Fontjoy Header & Controls */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E2DACD]">
                <div className="flex items-center gap-2">
                  <Type className="w-4 h-4 text-[#B85D19]" />
                  <h3 className="font-serif text-xl font-medium">Typography Tips</h3>
                </div>

                <div className="flex items-center gap-4">
                  {/* Contrast Mode Selector */}
                  <div className="flex items-center bg-[#FAF8F5] p-1 rounded-full border border-[#E2DACD]">
                    {(["high", "balanced", "similar"] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setFontContrast(mode)}
                        className={`px-3 py-1 rounded-full text-[11px] font-semibold capitalize transition-all ${
                          fontContrast === mode
                            ? "bg-[#121212] text-white shadow-xs"
                            : "text-[#121212]/60 hover:text-[#121212]"
                        }`}
                      >
                        {mode} Contrast
                      </button>
                    ))}
                  </div>

                  {/* Generate / Roll Pairing */}
                  <button
                    onClick={rollFontjoyFonts}
                    className="flex items-center gap-2 bg-[#121212] text-white px-5 py-2 rounded-full text-xs uppercase tracking-wider font-semibold hover:bg-[#B85D19] transition-all shadow-sm"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Generate
                  </button>
                </div>
              </div>

              {/* Fontjoy 3-Tier Layer View */}
              <div className="space-y-6">
                
                {/* 1. Header Level */}
                <div className="p-5 rounded-2xl border border-[#E2DACD] bg-[#FAF8F5]/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#B85D19]">Heading</span>
                      <span className="text-xs font-mono text-[#121212]/50">{headingFontName}</span>
                    </div>
                    <h2 
                      className="text-3xl md:text-4xl font-extrabold tracking-tight"
                      style={{ fontFamily: `'${headingFontName}', serif` }}
                    >
                      Form Follows Expression
                    </h2>
                  </div>

                  <div className="flex items-center gap-2 self-start md:self-center">
                    <button
                      onClick={() => setLockedFonts(prev => ({ ...prev, heading: !prev.heading }))}
                      className={`p-2.5 rounded-full border transition-all ${
                        lockedFonts.heading 
                          ? "bg-[#121212] text-white border-[#121212]" 
                          : "bg-white text-[#121212]/60 border-[#E2DACD] hover:border-[#121212]"
                      }`}
                      title={lockedFonts.heading ? "Unlock Heading" : "Lock Heading"}
                    >
                      {lockedFonts.heading ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* 2. Subheader Level */}
                <div className="p-5 rounded-2xl border border-[#E2DACD] bg-[#FAF8F5]/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#B85D19]">Subheader</span>
                      <span className="text-xs font-mono text-[#121212]/50">{subheadFontName}</span>
                    </div>
                    <h3 
                      className="text-xl md:text-2xl font-medium opacity-90"
                      style={{ fontFamily: `'${subheadFontName}', sans-serif` }}
                    >
                      Crafted visual systems that honor rhythm and hierarchy.
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 self-start md:self-center">
                    <button
                      onClick={() => setLockedFonts(prev => ({ ...prev, subhead: !prev.subhead }))}
                      className={`p-2.5 rounded-full border transition-all ${
                        lockedFonts.subhead 
                          ? "bg-[#121212] text-white border-[#121212]" 
                          : "bg-white text-[#121212]/60 border-[#E2DACD] hover:border-[#121212]"
                      }`}
                      title={lockedFonts.subhead ? "Unlock Subheader" : "Lock Subheader"}
                    >
                      {lockedFonts.subhead ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* 3. Body Level */}
                <div className="p-5 rounded-2xl border border-[#E2DACD] bg-[#FAF8F5]/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#B85D19]">Body</span>
                      <span className="text-xs font-mono text-[#121212]/50">{bodyFontName}</span>
                    </div>
                    <p 
                      className="text-sm md:text-base leading-relaxed opacity-80"
                      style={{ fontFamily: `'${bodyFontName}', sans-serif` }}
                    >
                      Typeface pairings are projected across deep vector embeddings to evaluate structural tension, aperture width, and optical balance across editorial and interface surfaces.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-start md:self-center">
                    <button
                      onClick={() => setLockedFonts(prev => ({ ...prev, body: !prev.body }))}
                      className={`p-2.5 rounded-full border transition-all ${
                        lockedFonts.body 
                          ? "bg-[#121212] text-white border-[#121212]" 
                          : "bg-white text-[#121212]/60 border-[#E2DACD] hover:border-[#121212]"
                      }`}
                      title={lockedFonts.body ? "Unlock Body" : "Lock Body"}
                    >
                      {lockedFonts.body ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* 3. LIVE MOCKUP PROOF */}
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
                    {headingFontName}
                  </span>
                </div>
                <span className="text-xs font-bold tracking-wider uppercase opacity-60">Identity System</span>
              </div>

              <div className="my-8 space-y-4">
                <h1 
                  className="text-4xl md:text-6xl font-extrabold tracking-tight leading-none capitalize"
                  style={{ fontFamily: `'${headingFontName}', serif` }}
                >
                  {brandDesc}
                </h1>
                <p 
                  className="text-base md:text-lg max-w-2xl font-medium leading-relaxed opacity-90"
                  style={{ fontFamily: `'${bodyFontName}', sans-serif` }}
                >
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

            {/* 4. MOOD BOARD */}
            <div className="bg-[#121212] text-[#F9F6F0] rounded-3xl p-6 md:p-8 shadow-xl space-y-6 overflow-hidden relative">
              <div className="flex flex-wrap items-end justify-between gap-3 relative z-10">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#D4874B] font-bold">Visual reference field</span>
                  <h3 className="font-serif text-2xl md:text-3xl font-medium mt-1">Mood board</h3>
                </div>
                <span className="text-xs text-white/50 uppercase tracking-wider">{activeConcept?.style || "Art direction"}</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 relative z-10">
                <div className="md:col-span-2 aspect-[1.55] rounded-2xl overflow-hidden border border-white/15 relative bg-[#2b2926]">
                  {imageUrl && !imageLoading ? (
                    <Image src={imageUrl} alt="Generated visual reference" fill unoptimized className="object-cover opacity-80" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-xs text-white/50">Awaiting visual reference</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <span className="absolute bottom-3 left-3 text-[10px] uppercase tracking-widest font-bold">Material / atmosphere</span>
                </div>
                {studioData.colors.slice(0, 2).map((color) => (
                  <div key={color.hex} className="aspect-square rounded-2xl p-3 flex flex-col justify-end" style={{ backgroundColor: color.hex, color: getReadableTextColor(color.hex) }}>
                    <span className="text-[10px] uppercase tracking-widest font-bold opacity-70">{color.role}</span>
                    <span className="text-sm font-mono mt-1">{color.hex.toUpperCase()}</span>
                  </div>
                ))}
                <div className="aspect-square rounded-2xl bg-[#F0E2C6] text-[#121212] p-4 flex flex-col justify-between">
                  <span className="text-[10px] uppercase tracking-widest font-bold opacity-60">Type voice</span>
                  <div>
                    <span className="block text-3xl leading-none" style={{ fontFamily: `'${headingFontName}', serif` }}>Aa</span>
                    <span className="block text-xs mt-2" style={{ fontFamily: `'${bodyFontName}', sans-serif` }}>{headingFontName}</span>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 border-t border-white/15 pt-5 relative z-10">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-white/45 font-bold">Concept signal</span>
                  <p className="font-serif text-lg mt-1">{activeConcept?.tagline || studioData.creativeBrief?.coreThesis}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-white/45 font-bold">Keywords to explore</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(brandData?.keywords || ["Tactile", "Distinctive", "Intentional"]).slice(0, 5).map(keyword => (
                      <span key={keyword} className="text-[11px] border border-white/20 rounded-full px-2.5 py-1 text-white/75">{keyword}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 5. INSTAGRAM SOCIAL CAMPAIGN POST MOCKUP */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-[#E2DACD] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <InstagramIcon className="w-4 h-4 text-[#B85D19]" />
                  <h3 className="font-serif text-xl font-medium">Instagram Brand Campaign Post</h3>
                </div>
                <button 
                  onClick={() => triggerFluxRender(
                    studioData.heroPrompt,
                    brandDesc,
                    studioData.colors,
                    studioData.typography?.heading?.font,
                    studioData.typography?.body?.font,
                    brandData?.concepts.find(c => c.id === selectedConcept)?.style
                  )}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 border border-[#E2DACD] rounded-full hover:bg-[#F9F6F0] transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${imageLoading ? 'animate-spin' : ''}`} />
                  Re-render Post
                </button>
              </div>

              <div className="flex justify-center py-2">
                <div className="w-full max-w-md bg-[#FAF8F5] border border-[#E2DACD] rounded-3xl p-4 shadow-lg flex flex-col gap-3">
                  <div className="flex items-center gap-2.5 pb-2 border-b border-[#E2DACD]/60">
                    <div className="w-7 h-7 rounded-full bg-[#121212] flex items-center justify-center text-white text-[10px] font-bold uppercase">
                      {brandDesc.slice(0, 2)}
                    </div>
                    <div>
                      <span className="text-xs font-bold block leading-tight">{brandDesc.toLowerCase().replace(/\s+/g, '_')}</span>
                      <span className="text-[10px] text-[#121212]/50 block leading-tight">Sponsored Brand Edition</span>
                    </div>
                  </div>

                  {imageLoading ? (
                    <div className="aspect-square w-full rounded-2xl bg-[#EFE9DF] flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-8 h-8 animate-spin text-[#B85D19]" />
                      <span className="text-xs text-[#121212]/60 font-medium">Synthesizing Instagram campaign mockup...</span>
                    </div>
                  ) : imageUrl ? (
                    <div className="aspect-square w-full rounded-2xl overflow-hidden shadow-inner border border-black/5 relative bg-black">
                      <Image src={imageUrl} alt="Instagram Campaign Mockup" fill unoptimized className="object-cover" />
                      <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-between" style={{ background: `linear-gradient(160deg, ${studioData.colors[0].hex}dd 0%, transparent 45%, ${studioData.colors[2].hex}cc 100%)`, color: getReadableTextColor(studioData.colors[0].hex) }}>
                        <div className="flex items-start justify-between gap-3">
                          <span className="text-[10px] uppercase tracking-[0.18em] font-bold border border-current/40 rounded-full px-2.5 py-1">{activeConcept?.style || "New identity"}</span>
                          <span className="text-xs font-mono opacity-80">01 / 04</span>
                        </div>
                        <div className="max-w-[82%]">
                          <h4 className="text-4xl md:text-5xl leading-[0.92] font-medium" style={{ fontFamily: `'${headingFontName}', serif` }}>{brandDesc}</h4>
                          <p className="text-xs md:text-sm leading-relaxed mt-3 max-w-xs" style={{ fontFamily: `'${bodyFontName}', sans-serif` }}>{studioData.creativeBrief?.coreThesis}</p>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  <div className="space-y-1.5 pt-1">
                    <p className="text-xs leading-relaxed text-[#121212]">
                      <span className="font-bold mr-1.5">{brandDesc.toLowerCase().replace(/\s+/g, '_')}</span>
                      {studioData.creativeBrief?.coreThesis}
                    </p>
                    <span className="text-[10px] text-[#B85D19] font-semibold block">#brandidentity #{brandDesc.toLowerCase().replace(/\s+/g, '')} #editorialdesign</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

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
                  ? "Critique or refine (e.g. 'Make the palette more muted and switch to an architectural display serif')..." 
                  : showCards 
                  ? "Select aesthetic pillars above..." 
                  : "Describe any brand, product, or event..."
              }
              className="w-full bg-white border border-[#E2DACD] rounded-full pl-6 pr-14 py-4 text-sm focus:outline-none focus:border-[#B85D19] shadow-sm transition-all duration-200 disabled:opacity-50"
            />
            <button 
              type="button"
              onClick={(e) => handleSend(e)}
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