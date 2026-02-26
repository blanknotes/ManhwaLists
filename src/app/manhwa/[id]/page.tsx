"use client";

import { use, useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import Image from "next/image";
import { Star, Loader2, ExternalLink, BookmarkPlus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { getManhwaById, type MALManhwa } from "@/lib/mal-api";
import { useUser, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useRouter } from "next/navigation";

export default function ManhwaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [manhwa, setManhwa] = useState<MALManhwa | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useUser();
  const db = useFirestore();

  useEffect(() => {
    const loadDetail = async () => {
      setLoading(true);
      const data = await getManhwaById(id);
      setManhwa(data);
      setLoading(false);
    };
    loadDetail();
  }, [id]);

  const handleStatusChange = (status: string) => {
    if (!user || !manhwa) {
      toast({
        variant: "destructive",
        title: "Sign in required",
        description: "Please log in to save manhwa to your list.",
      });
      return;
    }

    const entryRef = doc(db, 'users', user.uid, 'readingLists', 'default', 'entries', manhwa.mal_id.toString());
    
    setDocumentNonBlocking(entryRef, {
      manhwaId: manhwa.mal_id.toString(),
      title: manhwa.title,
      coverImageUrl: manhwa.images.webp.image_url,
      status: status,
      score: manhwa.score || 0,
      updatedAt: new Date().toISOString(),
      userId: user.uid
    }, { merge: true });

    toast({
      title: "List Updated",
      description: `"${manhwa.title}" is now marked as ${status}.`,
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="font-bold text-muted-foreground animate-pulse">Fetching details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!manhwa) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-20 text-center space-y-6">
          <h2 className="text-3xl font-black">Manhwa Not Found</h2>
          <Button onClick={() => router.back()} className="rounded-full font-bold">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        </div>
      </div>
    );
  }

  const isWebtoon = manhwa.genres.some(g => g.name.toLowerCase().includes('webtoon')) || 
                    manhwa.title.toLowerCase().includes('webtoon');

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          onClick={() => router.back()} 
          className="mb-8 font-black text-primary hover:bg-primary/5 rounded-full px-6 transition-all active:scale-95"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to List
        </Button>

        <div className="grid md:grid-cols-[320px_1fr] gap-10">
          <aside className="space-y-6">
            <div className="relative aspect-[2/3] rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white group">
              <Image 
                src={manhwa.images.webp.image_url} 
                alt={manhwa.title} 
                fill 
                className="object-cover transition-transform duration-700 group-hover:scale-110" 
                priority
              />
              {isWebtoon && (
                <div className="absolute top-4 right-4">
                  <Badge className="bg-green-500 hover:bg-green-600 border-none font-bold px-3 py-1">WEBTOON</Badge>
                </div>
              )}
            </div>
            
            <Card className="border-none bg-secondary/30 rounded-[2.5rem] overflow-hidden">
              <CardContent className="p-8 space-y-6">
                <div className="flex justify-between items-center">
                   <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">MAL Score</p>
                    <div className="flex items-center gap-2">
                      <Star className="w-6 h-6 fill-primary text-primary" />
                      <span className="text-3xl font-black">{manhwa.score || "N/A"}</span>
                    </div>
                  </div>
                   <div className="text-right space-y-1">
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Chapters</p>
                    <p className="text-xl font-bold">{manhwa.chapters || "Ongoing"}</p>
                  </div>
                </div>
                
                <div className="space-y-1 pt-4 border-t border-primary/10">
                  <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-3">My List Status</p>
                  <Select onValueChange={handleStatusChange}>
                    <SelectTrigger className="w-full bg-primary text-primary-foreground h-14 rounded-2xl font-bold shadow-lg shadow-primary/20 border-none hover:bg-primary/90 transition-all">
                      <BookmarkPlus className="w-5 h-5 mr-2" />
                      <SelectValue placeholder="Save to List" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl p-2">
                      <SelectItem value="Currently Reading" className="rounded-xl font-bold">Currently Reading</SelectItem>
                      <SelectItem value="Completed" className="rounded-xl font-bold">Completed</SelectItem>
                      <SelectItem value="On Hold" className="rounded-xl font-bold">On Hold</SelectItem>
                      <SelectItem value="Plan to Read" className="rounded-xl font-bold">Plan to Read</SelectItem>
                      <SelectItem value="Dropped" className="rounded-xl font-bold">Dropped</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Button variant="outline" className="w-full h-12 rounded-2xl font-bold border-2" onClick={() => window.open(`https://myanimelist.net/manga/${manhwa.mal_id}`, '_blank')}>
              <ExternalLink className="w-4 h-4 mr-2" />
              View on MyAnimeList
            </Button>
          </aside>

          <section className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="px-3 py-1 font-bold text-primary border-primary/20 bg-primary/5 rounded-full">
                  {manhwa.status}
                </Badge>
                {manhwa.authors && manhwa.authors.length > 0 && (
                  <span className="text-sm font-bold text-muted-foreground">
                    by {manhwa.authors.map(a => a.name).join(", ")}
                  </span>
                )}
              </div>
              <h1 className="text-4xl md:text-7xl font-black tracking-tighter leading-none">{manhwa.title}</h1>
              <div className="flex flex-wrap gap-2">
                {manhwa.genres.map(genre => (
                  <Badge key={genre.name} variant="secondary" className="px-4 py-1.5 rounded-full text-sm font-bold bg-secondary/60 text-primary">
                    {genre.name}
                  </Badge>
                ))}
              </div>
            </div>

            <Tabs defaultValue="details" className="w-full">
              <TabsList className="bg-secondary/40 p-1.5 h-16 w-full justify-start rounded-[2rem] mb-8">
                <TabsTrigger value="details" className="rounded-3xl px-10 h-full data-[state=active]:bg-white data-[state=active]:shadow-md font-black text-lg transition-all">Synopsis</TabsTrigger>
                <TabsTrigger value="info" className="rounded-3xl px-10 h-full data-[state=active]:bg-white data-[state=active]:shadow-md font-black text-lg transition-all">Information</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="bg-white/50 backdrop-blur-sm rounded-[2.5rem] p-8 md:p-12 border border-primary/5 shadow-inner">
                   <p className="text-xl md:text-2xl leading-relaxed text-muted-foreground whitespace-pre-wrap font-medium italic">
                    {manhwa.synopsis || "No synopsis available for this title."}
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="info" className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="grid sm:grid-cols-2 gap-12 bg-white/50 p-8 rounded-[2.5rem]">
                  <div className="space-y-6">
                    <h3 className="text-2xl font-black border-b-4 border-primary/10 pb-2 inline-block">Main Details</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center border-b pb-2">
                        <span className="text-muted-foreground font-bold">English Title</span>
                        <span className="font-black text-right max-w-[200px] truncate">{manhwa.title}</span>
                      </div>
                      <div className="flex justify-between items-center border-b pb-2">
                        <span className="text-muted-foreground font-bold">Authors</span>
                        <span className="font-black">{manhwa.authors?.[0]?.name || "N/A"}</span>
                      </div>
                      <div className="flex justify-between items-center border-b pb-2">
                        <span className="text-muted-foreground font-bold">MAL ID</span>
                        <span className="font-black">{manhwa.mal_id}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <h3 className="text-2xl font-black border-b-4 border-primary/10 pb-2 inline-block">Statistics</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center border-b pb-2">
                        <span className="text-muted-foreground font-bold">Rank</span>
                        <span className="font-black">Top {manhwa.rank || "N/A"}</span>
                      </div>
                      <div className="flex justify-between items-center border-b pb-2">
                        <span className="text-muted-foreground font-bold">Type</span>
                        <span className="font-black">Manhwa</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </section>
        </div>
      </main>
    </div>
  );
}
