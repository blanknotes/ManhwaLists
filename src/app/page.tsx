"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { ManhwaCard } from "@/components/manhwa-card";
import { GENRES } from "@/app/lib/db";
import { Button } from "@/components/ui/button";
import { Sparkles, Compass, ChevronRight, Loader2, Trophy, LayoutGrid, BookOpen } from "lucide-react";
import Link from "next/link";
import { getTopManhwa, type MALManhwa } from "@/lib/mal-api";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const [recommendedManhwa, setRecommendedManhwa] = useState<MALManhwa[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getTopManhwa();
      const shuffled = [...data].sort(() => 0.5 - Math.random());
      setRecommendedManhwa(shuffled.slice(0, 12));
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 space-y-16">
        {/* Hero Section */}
        <section className="relative rounded-[3rem] overflow-hidden bg-primary p-8 md:p-16 text-primary-foreground shadow-2xl">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
          <div className="relative z-10 max-w-2xl space-y-6">
            <Badge className="bg-white/20 hover:bg-white/30 text-white border-none py-1.5 px-4 rounded-full font-bold">
              AI-Powered Discovery Engine
            </Badge>
            <h1 className="text-5xl md:text-7xl font-black leading-none tracking-tighter">
              Find Your Next Favorite Story
            </h1>
            <p className="text-lg md:text-2xl text-primary-foreground/80 font-medium max-w-lg">
              Tired of the same old titles? Let our AI recommend the manhwa that best fits your taste.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Button size="lg" className="bg-white text-primary hover:bg-secondary rounded-full font-black px-10 h-14 text-lg shadow-xl transition-all active:scale-95" asChild>
                <Link href="/recommendations">
                  <Sparkles className="mr-2 w-5 h-5" />
                  Try AI Recs
                </Link>
              </Button>
              <Button size="lg" className="bg-white text-primary hover:bg-secondary rounded-full font-black px-10 h-14 text-lg shadow-xl transition-all active:scale-95" asChild>
                <Link href="/genres">
                  <LayoutGrid className="mr-2 w-5 h-5" />
                  Explore Genres
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <div className="grid lg:grid-cols-4 gap-12">
          {/* Main Discovery Section */}
          <div className="lg:col-span-3 space-y-12">
            <section className="space-y-8">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="text-4xl font-black flex items-center gap-3 tracking-tight">
                    <Compass className="text-primary w-10 h-10" />
                    Picked For You
                  </h2>
                  <p className="text-muted-foreground font-bold">Interesting titles you might have missed.</p>
                </div>
                <Button variant="ghost" size="sm" className="text-primary font-black text-lg hover:bg-primary/5 rounded-full px-6" asChild>
                  <Link href="/genres">Explore More <ChevronRight className="ml-1 w-5 h-5" /></Link>
                </Button>
              </div>
              
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                  <Loader2 className="w-12 h-12 animate-spin text-primary" />
                  <p className="font-bold text-muted-foreground">Searching for the best manhwa...</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
                  {recommendedManhwa.map((manhwa) => (
                    <ManhwaCard key={manhwa.mal_id} malManhwa={manhwa} />
                  ))}
                </div>
              )}
            </section>

            {/* AI Call to Action Section */}
            <section className="bg-secondary/20 rounded-[3rem] p-10 flex flex-col md:flex-row items-center gap-10 border-4 border-dashed border-primary/10">
              <div className="bg-white p-6 rounded-[2.5rem] shadow-xl rotate-3 shrink-0">
                <Sparkles className="w-16 h-16 text-primary" />
              </div>
              <div className="space-y-4 text-center md:text-left">
                <h3 className="text-3xl font-black tracking-tight">Haven't Found the One?</h3>
                <p className="text-lg text-muted-foreground font-medium max-w-xl">
                  Use our AI-powered recommendation feature. Enter the manhwa you've read, and we'll provide highly accurate suggestions.
                </p>
                <Button className="rounded-full px-8 font-black h-12 shadow-lg shadow-primary/20" asChild>
                  <Link href="/recommendations">Get AI Recommendations</Link>
                </Button>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-10">
            {/* Ranking Shortcut */}
            <section className="bg-white rounded-[2.5rem] p-8 space-y-6 shadow-sm border border-secondary">
               <div className="flex items-center gap-3">
                 <div className="p-2 bg-primary/10 rounded-xl">
                   <Trophy className="w-5 h-5 text-primary" />
                 </div>
                 <h3 className="text-xl font-black">Top Ranking</h3>
               </div>
               <p className="text-sm text-muted-foreground font-medium">See who is leading the global popularity charts this week.</p>
               <Button variant="secondary" className="w-full rounded-2xl font-black h-12" asChild>
                 <Link href="/ranking">Open Leaderboard</Link>
               </Button>
            </section>

            {/* Quick Genres */}
            <section className="bg-white rounded-[2.5rem] p-8 space-y-6 shadow-sm border border-secondary">
              <h3 className="text-xl font-black flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-primary" />
                Popular Genres
              </h3>
              <div className="flex flex-wrap gap-2">
                {GENRES.slice(0, 10).map((genre) => (
                  <Link key={genre} href={`/genres`}>
                    <Button variant="outline" size="sm" className="bg-secondary/30 hover:bg-primary hover:text-white transition-all rounded-full border-none font-bold">
                      {genre}
                    </Button>
                  </Link>
                ))}
              </div>
              <Button variant="ghost" className="w-full text-primary font-black hover:bg-primary/5 rounded-xl" asChild>
                 <Link href="/genres">View All Genres</Link>
              </Button>
            </section>

            {/* Community Shoutout */}
            <section className="bg-primary text-primary-foreground rounded-[2.5rem] p-8 space-y-4 shadow-xl">
               <BookOpen className="w-8 h-8 opacity-50" />
               <h3 className="text-xl font-black">Join Community</h3>
               <p className="text-sm font-medium opacity-80">Discuss the latest chapters with thousands of other readers in our forum.</p>
               <Button className="w-full bg-white text-primary hover:bg-secondary rounded-2xl font-black h-12" asChild>
                 <Link href="/forums">Open Forum</Link>
               </Button>
            </section>
          </aside>
        </div>
      </main>

      <footer className="border-t bg-white py-12 mt-12">
        <div className="container mx-auto px-4 text-center space-y-4">
          <p className="text-primary font-black text-3xl tracking-tighter">ManhwaList</p>
          <p className="text-sm text-muted-foreground font-bold">Database integrated with MyAnimeList Jikan API.</p>
          <div className="flex justify-center gap-6 pt-4">
            <Link href="/ranking" className="text-xs font-black uppercase hover:text-primary">Ranking</Link>
            <Link href="/genres" className="text-xs font-black uppercase hover:text-primary">Genres</Link>
            <Link href="/recommendations" className="text-xs font-black uppercase hover:text-primary">AI Recs</Link>
            <Link href="/forums" className="text-xs font-black uppercase hover:text-primary">Forums</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
