"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { GENRES } from "@/app/lib/db";
import { ManhwaCard } from "@/components/manhwa-card";
import { LayoutGrid, Loader2, BookOpen, X, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { searchManhwa, getManyTopManhwa, type MALManhwa } from "@/lib/mal-api";
import { useRouter } from "next/navigation";

export default function GenresPage() {
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [manhwas, setManhwas] = useState<MALManhwa[]>([]);
  const [loading, setLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    const savedGenre = localStorage.getItem("genres_selected_genre");
    const savedManhwas = localStorage.getItem("genres_manhwas_cache");

    if (savedGenre) setSelectedGenre(savedGenre);
    
    if (savedManhwas) {
      setManhwas(JSON.parse(savedManhwas));
    } else {
      loadInitial();
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      if (selectedGenre) localStorage.setItem("genres_selected_genre", selectedGenre);
      else localStorage.removeItem("genres_selected_genre");
      localStorage.setItem("genres_manhwas_cache", JSON.stringify(manhwas));
    }
  }, [selectedGenre, manhwas, isMounted]);

  const loadInitial = async () => {
    setLoading(true);
    const data = await getManyTopManhwa(60);
    setManhwas(data);
    setLoading(false);
  };

  const handleGenreClick = async (genre: string) => {
    if (selectedGenre === genre) {
      setSelectedGenre(null);
      setLoading(true);
      const data = await getManyTopManhwa(60);
      setManhwas(data);
      setLoading(false);
      return;
    }

    setSelectedGenre(genre);
    setLoading(true);
    const results = await searchManhwa(genre);
    setManhwas(results);
    setLoading(false);
  };

  if (!isMounted) return null;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          onClick={() => router.back()} 
          className="mb-8 font-black text-primary hover:bg-primary/5 rounded-full"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Back
        </Button>

        <header className="mb-12 space-y-4 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3 text-primary mb-2">
            <LayoutGrid className="w-8 h-8" />
            <span className="text-sm font-black uppercase tracking-widest">Explore Categories</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter">Manhwa by Genre</h1>
          <p className="text-muted-foreground font-bold text-lg max-w-2xl">Find your next favorite story by the categories you love most.</p>
        </header>

        <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-16">
          {GENRES.map((genre) => (
            <button
              key={genre}
              onClick={() => handleGenreClick(genre)}
              className={`p-6 rounded-[2rem] font-black text-lg transition-all border-4 ${
                selectedGenre === genre 
                ? "bg-primary text-white border-primary shadow-xl scale-105" 
                : "bg-white hover:bg-secondary/50 border-secondary/20 shadow-sm"
              }`}
            >
              {genre}
            </button>
          ))}
        </section>

        <div className="flex items-center justify-between mb-8 pb-4 border-b">
          <h2 className="text-3xl font-black">
            {selectedGenre ? `Results for "${selectedGenre}"` : "Most Popular Now"}
          </h2>
          {selectedGenre && (
            <Button 
              variant="ghost" 
              onClick={() => {
                setSelectedGenre(null);
                loadInitial();
              }}
              className="font-bold text-destructive hover:bg-destructive/5 rounded-full"
            >
              <X className="w-4 h-4 mr-2" /> Clear Filter
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-40">
            <Loader2 className="w-16 h-16 animate-spin text-primary" />
          </div>
        ) : manhwas.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8 animate-in fade-in duration-500">
            {manhwas.map((manhwa, idx) => (
              <ManhwaCard key={`${manhwa.mal_id}-${idx}`} malManhwa={manhwa} />
            ))}
          </div>
        ) : (
          <div className="text-center py-40">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
            <p className="text-muted-foreground font-bold">No manhwa found for this genre.</p>
          </div>
        )}
      </main>
    </div>
  );
}
