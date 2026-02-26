"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { Navbar } from "@/components/navbar";
import { GENRES } from "@/app/lib/db";
import { ManhwaCard } from "@/components/manhwa-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ArrowUpDown, Loader2, Globe, ArrowLeft, Star, RotateCcw } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getManyTopManhwa, searchManhwa, type MALManhwa } from "@/lib/mal-api";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter, useSearchParams } from "next/navigation";

function BrowseContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || "";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [manhwas, setManhwas] = useState<MALManhwa[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [source, setSource] = useState("all");
  const [sortBy, setSortBy] = useState("rank");
  const [isMounted, setIsMounted] = useState(false);
  
  const [suggestions, setSuggestions] = useState<MALManhwa[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
    const savedManhwas = localStorage.getItem("browse_manhwas_cache");
    const savedQuery = localStorage.getItem("browse_search_query");
    const savedGenres = localStorage.getItem("browse_selected_genres");
    const savedSource = localStorage.getItem("browse_source");
    const savedSort = localStorage.getItem("browse_sort");
    
    if (savedGenres) setSelectedGenres(JSON.parse(savedGenres));
    if (savedSource) setSource(savedSource);
    if (savedSort) setSortBy(savedSort);
    
    if (initialQuery) {
      setSearchQuery(initialQuery);
      performSearch(initialQuery);
    } else if (savedManhwas) {
      setManhwas(JSON.parse(savedManhwas));
      setSearchQuery(savedQuery || "");
      setLoading(false);
    } else {
      loadInitialData();
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [initialQuery]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("browse_manhwas_cache", JSON.stringify(manhwas));
      localStorage.setItem("browse_search_query", searchQuery);
      localStorage.setItem("browse_selected_genres", JSON.stringify(selectedGenres));
      localStorage.setItem("browse_source", source);
      localStorage.setItem("browse_sort", sortBy);
    }
  }, [manhwas, searchQuery, selectedGenres, source, sortBy, isMounted]);

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      const results = await searchManhwa(searchQuery);
      setSuggestions(results.slice(0, 8));
    }, 300);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery]);

  const loadInitialData = async () => {
    setLoading(true);
    const data = await getManyTopManhwa(120);
    setManhwas(data);
    setLoading(false);
  };

  const performSearch = async (query: string) => {
    setLoading(true);
    setShowSuggestions(false);
    if (!query.trim()) {
      await loadInitialData();
    } else {
      const results = await searchManhwa(query);
      setManhwas(results);
    }
    setLoading(false);
  };

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    performSearch(searchQuery);
  };

  if (!isMounted) return null;

  let filteredManhwa = manhwas.filter(m => {
    const matchesGenres = selectedGenres.length === 0 || 
      selectedGenres.some(g => m.genres?.some(mg => mg.name.toLowerCase().includes(g.toLowerCase())));
    
    const isWebtoon = m.genres?.some(g => g.name.toLowerCase().includes('webtoon')) || 
                      m.title.toLowerCase().includes('webtoon');
    
    if (source === 'webtoon') return matchesGenres && isWebtoon;
    if (source === 'mal') return matchesGenres && !isWebtoon;
    return matchesGenres;
  });

  filteredManhwa = [...filteredManhwa].sort((a, b) => {
    if (sortBy === 'rank') return (a.rank || 99999) - (b.rank || 99999);
    if (sortBy === 'rating') return (b.score || 0) - (a.score || 0);
    return 0;
  });

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev => 
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <header className="space-y-8 mb-12">
          <div className="flex flex-col md:flex-row md:items-center gap-6 mb-4">
            <Button 
              variant="ghost" 
              onClick={() => router.back()} 
              className="font-black text-primary hover:bg-primary/5 rounded-full px-6 transition-all active:scale-95"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Go Back
            </Button>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-5xl font-black tracking-tighter">Explore Manhwa</h1>
              <p className="text-muted-foreground font-bold text-lg">Discover the best Korean titles from our global collection.</p>
            </div>
            
            <div className="bg-secondary/30 p-1 rounded-2xl flex gap-1">
              <Button 
                variant={source === 'all' ? 'default' : 'ghost'} 
                onClick={() => setSource('all')}
                className="rounded-xl font-bold px-6"
              >All</Button>
              <Button 
                variant={source === 'webtoon' ? 'default' : 'ghost'} 
                onClick={() => setSource('webtoon')}
                className="rounded-xl font-bold px-6"
              >Webtoons</Button>
              <Button 
                variant={source === 'mal' ? 'default' : 'ghost'} 
                onClick={() => setSource('mal')}
                className="rounded-xl font-bold px-6"
              >MAL Top</Button>
            </div>
          </div>

          <div className="relative" ref={containerRef}>
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
                <Input 
                  placeholder="Find your favorite manhwa..." 
                  className="pl-14 h-16 rounded-3xl bg-white border-none focus-visible:ring-primary text-xl font-medium shadow-sm"
                  value={searchQuery}
                  autoComplete="off"
                  onFocus={() => setShowSuggestions(true)}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                />
              </div>
              <div className="flex gap-2">
                 <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[200px] h-16 rounded-3xl bg-white border-none font-black text-lg shadow-sm">
                    <ArrowUpDown className="w-5 h-5 mr-3" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value="rank" className="font-bold">Global Rank</SelectItem>
                    <SelectItem value="rating" className="font-bold">Highest Score</SelectItem>
                  </SelectContent>
                </Select>
                 <Button type="submit" className="h-16 rounded-3xl px-10 font-black text-lg shadow-lg shadow-primary/20">
                  Search
                </Button>
              </div>
            </form>

            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-primary/5 z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                <ScrollArea className="max-h-[400px]">
                  <div className="p-3 grid grid-cols-1 gap-1">
                    <div className="px-4 py-2 text-[10px] uppercase font-black tracking-widest text-muted-foreground opacity-50">Suggestions</div>
                    {suggestions.map((s, idx) => (
                      <button
                        key={`${s.mal_id}-${idx}`}
                        type="button"
                        onClick={() => {
                          setSearchQuery(s.title);
                          performSearch(s.title);
                        }}
                        className="w-full p-3 text-left hover:bg-primary/5 rounded-2xl flex items-center gap-4 transition-all group"
                      >
                        <div className="w-12 h-16 bg-secondary rounded-xl overflow-hidden flex-shrink-0 relative shadow-sm group-hover:scale-105 transition-transform">
                          <img src={s.images?.webp?.image_url} alt="" className="object-cover w-full h-full" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-black block truncate text-lg group-hover:text-primary transition-colors">{s.title}</span>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs font-bold text-muted-foreground bg-secondary/40 px-2 py-0.5 rounded-full">{s.genres?.[0]?.name || "Action"}</span>
                            <div className="flex items-center gap-1 text-xs font-black text-primary">
                              <Star className="w-3 h-3 fill-primary" />
                              {s.score || "N/A"}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {GENRES.map(genre => (
              <Button 
                key={genre}
                variant={selectedGenres.includes(genre) ? "default" : "secondary"}
                onClick={() => toggleGenre(genre)}
                className={`rounded-full px-6 py-2 font-black transition-all text-sm h-auto border-none shadow-sm ${
                  selectedGenres.includes(genre) ? "bg-primary text-white scale-105" : "bg-white text-muted-foreground hover:bg-secondary"
                }`}
              >
                {genre}
              </Button>
            ))}
          </div>
        </header>

        <div className="flex items-center justify-between mb-8 pb-4 border-b border-primary/5">
          <div className="flex items-center gap-3">
            <Globe className="w-6 h-6 text-primary" />
            <p className="text-muted-foreground font-black text-lg">
              Showing <span className="text-primary">{filteredManhwa.length}</span> Results
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => {
            setSelectedGenres([]); 
            setSearchQuery(""); 
            setSource('all'); 
            setSortBy('rank');
            localStorage.removeItem("browse_manhwas_cache");
            loadInitialData();
          }} className="text-sm font-black text-primary hover:bg-primary/5 rounded-full px-6">
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset All
          </Button>
        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center py-40 space-y-6">
            <Loader2 className="w-20 h-20 animate-spin text-primary" />
            <p className="text-2xl font-black animate-pulse">Syncing Database...</p>
          </div>
        ) : filteredManhwa.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8 animate-in fade-in duration-500">
            {filteredManhwa.map((manhwa, idx) => (
              <ManhwaCard key={`${manhwa.mal_id}-${idx}`} malManhwa={manhwa} />
            ))}
          </div>
        ) : (
          <div className="text-center py-40 bg-secondary/5 rounded-[40px] border-4 border-dashed border-primary/10">
             <Globe className="w-12 h-12 text-muted-foreground mx-auto mb-6" />
             <h2 className="text-3xl font-black mb-2">No Match Found</h2>
             <p className="text-muted-foreground font-bold text-lg">Try different keywords or check your filters.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      </div>
    }>
      <BrowseContent />
    </Suspense>
  );
}
