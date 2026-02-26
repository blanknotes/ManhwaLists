"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { Trophy, Loader2, Globe, Search, Star, ChevronRight, ArrowLeft } from "lucide-react";
import { getManyTopManhwa, type MALManhwa } from "@/lib/mal-api";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RankingPage() {
  const [manhwas, setManhwas] = useState<MALManhwa[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    const savedRanking = localStorage.getItem("ranking_manhwas_cache");
    
    if (savedRanking) {
      setManhwas(JSON.parse(savedRanking));
      setLoading(false);
    } else {
      loadData();
    }
  }, []);

  useEffect(() => {
    if (isMounted && manhwas.length > 0) {
      localStorage.setItem("ranking_manhwas_cache", JSON.stringify(manhwas));
    }
  }, [manhwas, isMounted]);

  const loadData = async () => {
    setLoading(true);
    const data = await getManyTopManhwa(200);
    setManhwas(data);
    setLoading(false);
  };

  if (!isMounted) return null;

  const filteredRanking = manhwas.filter(m => 
    m.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        <header className="space-y-6 mb-12">
          <Button 
            variant="ghost" 
            onClick={() => router.back()} 
            className="mb-4 font-black text-primary hover:bg-primary/5 rounded-full"
          >
            <ArrowLeft className="w-5 h-5 mr-2" /> Back
          </Button>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-primary">
                <div className="p-3 bg-primary/10 rounded-2xl">
                  <Trophy className="w-8 h-8" />
                </div>
                <span className="text-sm font-black uppercase tracking-widest">Global Leaderboard</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-black tracking-tighter">Top 200 Manhwa</h1>
              <p className="text-muted-foreground font-bold text-lg max-w-xl">
                The world's best manhwa titles ranked by popularity and global scores.
              </p>
            </div>

            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input 
                placeholder="Search in ranking..." 
                className="pl-12 h-14 rounded-2xl bg-secondary/30 border-none font-bold shadow-inner"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </header>

        {loading ? (
          <div className="flex flex-col justify-center items-center py-40 space-y-6">
            <div className="relative">
              <Loader2 className="w-20 h-20 animate-spin text-primary" />
              <Trophy className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-primary/40" />
            </div>
            <p className="text-2xl font-black animate-pulse">Sorting the ranks...</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {filteredRanking.map((manhwa, index) => (
              <Link key={`${manhwa.mal_id}-${index}`} href={`/manhwa/${manhwa.mal_id}`}>
                <div className="flex items-center gap-4 md:gap-8 bg-white p-4 md:p-6 rounded-[2.5rem] shadow-sm border-2 border-transparent hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all group">
                  <div className="w-12 md:w-20 shrink-0 text-center">
                    <span className={`text-3xl md:text-5xl font-black transition-colors ${
                      index < 3 ? "text-primary" : "text-muted-foreground/30 group-hover:text-primary/40"
                    }`}>
                      {index + 1}
                    </span>
                  </div>

                  <div className="relative w-20 h-28 md:w-24 md:h-36 rounded-2xl overflow-hidden shadow-lg shrink-0 group-hover:scale-105 transition-transform duration-500">
                    <Image 
                      src={manhwa.images.webp.image_url} 
                      alt={manhwa.title} 
                      fill 
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0 space-y-2 md:space-y-3">
                    <div className="space-y-1">
                      <h2 className="text-xl md:text-3xl font-black tracking-tight line-clamp-1 group-hover:text-primary transition-colors">
                        {manhwa.title}
                      </h2>
                      <div className="flex flex-wrap items-center gap-2 md:gap-4">
                        <Badge variant="secondary" className="bg-primary/5 text-primary border-none font-black text-[10px] md:text-xs uppercase tracking-widest px-3 py-1">
                          {manhwa.genres?.[0]?.name || "Action"}
                        </Badge>
                        <div className="flex items-center gap-1.5">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-black text-sm md:text-lg">{manhwa.score || "N/A"}</span>
                        </div>
                        <span className="hidden sm:inline-block text-xs font-bold text-muted-foreground">
                          {manhwa.status} • {manhwa.chapters || "?"} Ch
                        </span>
                      </div>
                    </div>
                    <p className="hidden md:line-clamp-2 text-sm text-muted-foreground font-medium opacity-70">
                      {manhwa.synopsis}
                    </p>
                  </div>

                  <div className="hidden sm:flex items-center justify-center w-12 h-12 rounded-full bg-secondary/30 group-hover:bg-primary group-hover:text-white transition-all">
                    <ChevronRight className="w-6 h-6" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!loading && filteredRanking.length === 0 && (
          <div className="text-center py-40 bg-secondary/10 rounded-[40px] border-4 border-dashed border-primary/10">
            <Globe className="w-20 h-20 text-muted-foreground mx-auto mb-6 opacity-20" />
            <h2 className="text-3xl font-black mb-2">No Results Found</h2>
            <p className="text-muted-foreground font-bold text-lg">Try a different title within the top 200 list.</p>
          </div>
        )}
      </main>
    </div>
  );
}
