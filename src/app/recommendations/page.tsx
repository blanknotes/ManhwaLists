"use client";

import { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Loader2, BookCheck, Plus, X, BrainCircuit, Search, Check } from "lucide-react";
import { recommendManhwa } from "@/ai/flows/manhwa-recommendation";
import { ManhwaCard } from "@/components/manhwa-card";
import { searchManhwa, type MALManhwa } from "@/lib/mal-api";
import { Badge } from "@/components/ui/badge";
import { GENRES } from "@/app/lib/db";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";

export default function RecommendationsPage() {
  const [selectedTitles, setSelectedTitles] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<{malData: MALManhwa, reason: string}[]>([]);
  
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<MALManhwa[]>([]);
  const [isSearchingSuggestions, setIsSearchingSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsMounted(true);
    const savedTitles = localStorage.getItem("ai_selected_titles");
    const savedGenres = localStorage.getItem("ai_selected_genres");
    const savedRecs = localStorage.getItem("ai_recommendations");

    if (savedTitles) setSelectedTitles(JSON.parse(savedTitles));
    if (savedGenres) setSelectedGenres(JSON.parse(savedGenres));
    if (savedRecs) setRecommendations(JSON.parse(savedRecs));
    
    if (!savedTitles) setSelectedTitles(["Solo Leveling", "Omniscient Reader"]);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem("ai_selected_titles", JSON.stringify(selectedTitles));
    localStorage.setItem("ai_selected_genres", JSON.stringify(selectedGenres));
    localStorage.setItem("ai_recommendations", JSON.stringify(recommendations));
  }, [selectedTitles, selectedGenres, recommendations, isMounted]);

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (inputValue.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsSearchingSuggestions(true);
    searchTimeoutRef.current = setTimeout(async () => {
      const results = await searchManhwa(inputValue);
      setSuggestions(results.slice(0, 5));
      setIsSearchingSuggestions(false);
    }, 500);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [inputValue]);

  const handleAddTitle = (title: string) => {
    if (title && !selectedTitles.includes(title)) {
      setSelectedTitles([...selectedTitles, title]);
      setInputValue("");
      setSuggestions([]);
    }
  };

  const handleRemoveTitle = (title: string) => {
    setSelectedTitles(selectedTitles.filter(t => t !== title));
  };

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev => 
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
    );
  };

  const handleGetRecommendations = async () => {
    if (selectedTitles.length === 0) return;
    setLoading(true);
    
    try {
      const result = await recommendManhwa({
        readManhwaTitles: selectedTitles,
        preferredGenres: selectedGenres,
        numberOfRecommendations: 4
      });

      const enrichedRecs = await Promise.all(
        result.recommendations.map(async (rec) => {
          const searchResults = await searchManhwa(rec.title);
          if (searchResults && searchResults.length > 0) {
            return {
              malData: searchResults[0],
              reason: rec.reason
            };
          }
          return null;
        })
      );

      setRecommendations(enrichedRecs.filter((r): r is {malData: MALManhwa, reason: string} => r !== null));
    } catch (error) {
      console.error("AI Recommendation error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <section className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest animate-bounce">
            <BrainCircuit className="w-4 h-4" />
            AI Discovery v3.0
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter">Smart Recommendation</h1>
          <p className="text-xl text-muted-foreground font-bold max-w-2xl mx-auto">
            Use the power of AI to analyze your reading taste and favorite genres accurately.
          </p>
        </section>

        <div className="grid lg:grid-cols-[1fr_400px] gap-12 items-start">
          <section className="space-y-12">
            <div className="bg-white rounded-[3rem] p-8 shadow-sm border border-primary/5 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black">Choose Favorite Genres</h3>
                <Badge variant="outline" className="font-bold">{selectedGenres.length} Selected</Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                {GENRES.map(genre => (
                  <Button
                    key={genre}
                    variant={selectedGenres.includes(genre) ? "default" : "secondary"}
                    onClick={() => toggleGenre(genre)}
                    className={`rounded-full px-5 py-2 font-bold transition-all h-auto border-none ${
                      selectedGenres.includes(genre) ? "bg-primary text-white scale-105" : "bg-secondary/40 text-muted-foreground hover:bg-secondary/60"
                    }`}
                  >
                    {selectedGenres.includes(genre) && <Check className="w-4 h-4 mr-2" />}
                    {genre}
                  </Button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 space-y-8 bg-secondary/10 rounded-[40px] border-4 border-dashed border-primary/20">
                <div className="relative">
                   <Loader2 className="w-24 h-24 animate-spin text-primary" />
                   <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-primary/40" />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-3xl font-black animate-pulse">Calculating Match...</p>
                  <p className="text-muted-foreground font-bold">Analyzing {selectedTitles.length} titles and {selectedGenres.length} genres</p>
                </div>
              </div>
            ) : recommendations.length > 0 ? (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <div className="flex items-center justify-between border-b pb-4 border-primary/10">
                  <h2 className="text-4xl font-black tracking-tight">AI Analysis Results</h2>
                  <Button variant="ghost" onClick={() => {
                    setRecommendations([]);
                    localStorage.removeItem("ai_recommendations");
                  }} className="font-black text-primary rounded-full">Reset</Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {recommendations.map((rec) => (
                    <div key={rec.malData.mal_id} className="flex gap-6 bg-white p-4 rounded-[2rem] shadow-sm border hover:shadow-xl transition-all group">
                       <div className="w-32 h-44 shrink-0">
                         <ManhwaCard malManhwa={rec.malData} />
                       </div>
                       <div className="flex-1 py-2 flex flex-col justify-center gap-3">
                          <Link href={`/manhwa/${rec.malData.mal_id}`}>
                            <h3 className="font-black text-xl line-clamp-2 leading-tight group-hover:text-primary transition-colors cursor-pointer">
                              {rec.malData.title}
                            </h3>
                          </Link>
                          <div className="bg-secondary/40 p-3 rounded-2xl italic text-sm font-medium text-muted-foreground border-l-4 border-primary/30">
                            "{rec.reason}"
                          </div>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-32 bg-secondary/10 rounded-[40px] border-4 border-dashed border-primary/10">
                <Sparkles className="w-20 h-20 text-primary/20 mx-auto mb-6" />
                <h3 className="text-3xl font-black mb-2">Start Discovery</h3>
                <p className="text-muted-foreground font-bold text-lg">Add manhwa you've already read and select your preferred genres.</p>
              </div>
            )}
          </section>

          <aside className="space-y-8 sticky top-24">
            <div className="bg-white rounded-[3rem] p-8 shadow-xl border border-primary/5 space-y-8">
              <div className="space-y-4">
                <h3 className="text-2xl font-black flex items-center gap-3">
                  <BookCheck className="w-6 h-6 text-primary" />
                  Your Reading List
                </h3>
                
                <div className="flex flex-wrap gap-2 pt-2">
                  {selectedTitles.map(title => (
                    <Badge key={title} className="bg-secondary text-secondary-foreground hover:bg-destructive hover:text-white transition-all px-4 py-2 rounded-xl font-bold cursor-default group text-sm border-none shadow-sm">
                      {title}
                      <button onClick={() => handleRemoveTitle(title)} className="ml-2">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                  {selectedTitles.length === 0 && (
                    <p className="text-xs text-muted-foreground italic">No titles added yet.</p>
                  )}
                </div>
              </div>

              <div className="space-y-4 relative">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      placeholder="Type a manhwa title..." 
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      className="rounded-2xl h-14 pl-10 bg-secondary/20 border-none font-bold"
                    />
                  </div>
                  <Button onClick={() => handleAddTitle(inputValue)} className="h-14 w-14 rounded-2xl p-0 shrink-0" disabled={!inputValue}>
                    <Plus className="w-6 h-6" />
                  </Button>
                </div>

                {/* Suggestions Dropdown */}
                {(suggestions.length > 0 || isSearchingSuggestions) && (
                  <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-primary/10 z-50 overflow-hidden">
                    {isSearchingSuggestions ? (
                      <div className="p-4 flex items-center justify-center gap-2 text-muted-foreground text-sm font-bold">
                        <Loader2 className="w-4 h-4 animate-spin" /> Searching suggestions...
                      </div>
                    ) : (
                      <ScrollArea className="max-h-60">
                        {suggestions.map((s) => (
                          <button
                            key={s.mal_id}
                            onClick={() => handleAddTitle(s.title)}
                            className="w-full p-4 text-left hover:bg-primary/5 border-b last:border-none flex items-center gap-3 transition-colors"
                          >
                            <div className="w-8 h-12 bg-secondary rounded-md overflow-hidden flex-shrink-0 relative">
                              <img src={s.images.webp.image_url} alt="" className="object-cover w-full h-full" />
                            </div>
                            <span className="font-bold text-sm truncate">{s.title}</span>
                          </button>
                        ))}
                      </ScrollArea>
                    )}
                  </div>
                )}

                <Button 
                  onClick={handleGetRecommendations} 
                  disabled={loading || selectedTitles.length < 1}
                  className="w-full h-16 rounded-[2rem] text-xl font-black shadow-2xl shadow-primary/30 transition-all hover:scale-[1.02]"
                >
                  {loading ? <Loader2 className="w-6 h-6 animate-spin mr-3" /> : <Sparkles className="w-6 h-6 mr-3" />}
                  Get AI Suggestions
                </Button>
              </div>

              <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                 <p className="text-xs font-bold text-primary text-center">
                   Tip: Add at least 2-3 titles for more precise results.
                 </p>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
