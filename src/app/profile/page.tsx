"use client";

import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Settings, BookOpen, ListPlus, Star, Loader2, LogOut } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useUser, useCollection, useAuth, useFirestore } from "@/firebase";
import { useMemoFirebase } from "@/firebase/provider";
import { collection } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const auth = useAuth();
  const router = useRouter();

  const readingListQuery = useMemoFirebase(() => {
    if (!user || !db) return null;
    return collection(db, 'users', user.uid, 'readingLists', 'default', 'entries');
  }, [user, db]);

  const { data: entries, isLoading: isListLoading } = useCollection(readingListQuery);

  if (isUserLoading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6">
          <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center">
            <BookOpen className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-black">Sign in to view your profile</h1>
          <p className="text-muted-foreground max-w-md font-medium">
            Keep track of your favorite manhwa, see your stats, and get personalized recommendations.
          </p>
          <Button size="lg" className="rounded-full px-10 font-bold" asChild>
            <Link href="/login">Sign In / Sign Up</Link>
          </Button>
        </main>
      </div>
    );
  }

  const handleLogout = () => {
    signOut(auth);
    router.push("/");
  };

  const readingCount = entries?.filter(e => e.status === 'Currently Reading').length || 0;
  const completedCount = entries?.filter(e => e.status === 'Completed').length || 0;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <section className="bg-primary rounded-3xl p-8 md:p-12 text-primary-foreground mb-12 shadow-2xl shadow-primary/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
            <div className="w-32 h-32 rounded-full border-4 border-white/40 overflow-hidden shadow-xl bg-white/10 flex-shrink-0">
               <Image src={`https://picsum.photos/seed/${user.uid}/400`} alt="Avatar" width={128} height={128} className="object-cover" />
            </div>
            <div className="flex-1 text-center md:text-left space-y-3">
              <h1 className="text-4xl font-black tracking-tight">{user.email?.split('@')[0]}</h1>
              <p className="text-primary-foreground/80 font-bold text-lg">Manhwa Enthusiast • {user.email}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-4">
                <div className="bg-white/10 px-6 py-3 rounded-2xl backdrop-blur-md border border-white/10 text-center min-w-[100px]">
                   <p className="text-[10px] uppercase font-black opacity-60 tracking-widest">Saved</p>
                   <p className="text-2xl font-black">{entries?.length || 0}</p>
                </div>
                <div className="bg-white/10 px-6 py-3 rounded-2xl backdrop-blur-md border border-white/10 text-center min-w-[100px]">
                   <p className="text-[10px] uppercase font-black opacity-60 tracking-widest">Reading</p>
                   <p className="text-2xl font-black">{readingCount}</p>
                </div>
                <div className="bg-white/10 px-6 py-3 rounded-2xl backdrop-blur-md border border-white/10 text-center min-w-[100px]">
                   <p className="text-[10px] uppercase font-black opacity-60 tracking-widest">Completed</p>
                   <p className="text-2xl font-black">{completedCount}</p>
                </div>
              </div>
            </div>
            <div className="flex md:flex-col gap-3">
              <Button variant="outline" size="icon" className="bg-white/10 border-white/20 hover:bg-white/30 rounded-2xl h-12 w-12 transition-all">
                <Settings className="w-6 h-6" />
              </Button>
              <Button variant="outline" size="icon" className="bg-white/10 border-white/20 hover:bg-white/30 rounded-2xl h-12 w-12 transition-all" onClick={handleLogout}>
                <LogOut className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </section>

        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-black tracking-tighter">My Reading Lists</h2>
            <Button variant="secondary" className="rounded-full font-bold px-6 h-12 shadow-sm">
              <ListPlus className="w-5 h-5 mr-2" />
              New List
            </Button>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="bg-secondary/40 p-1.5 h-16 rounded-3xl mb-8 w-full justify-start overflow-x-auto">
              <TabsTrigger value="all" className="rounded-2xl px-10 h-full data-[state=active]:bg-white data-[state=active]:shadow-md font-black text-lg transition-all">All Saved</TabsTrigger>
              <TabsTrigger value="reading" className="rounded-2xl px-10 h-full data-[state=active]:bg-white data-[state=active]:shadow-md font-black text-lg transition-all">Currently Reading</TabsTrigger>
              <TabsTrigger value="completed" className="rounded-2xl px-10 h-full data-[state=active]:bg-white data-[state=active]:shadow-md font-black text-lg transition-all">Completed</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6">
              {isListLoading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="w-10 h-10 animate-spin text-primary" />
                </div>
              ) : entries && entries.length > 0 ? (
                <div className="grid gap-6">
                  {entries.map((entry) => (
                    <Link key={entry.id} href={`/manhwa/${entry.manhwaId}`}>
                      <div className="bg-card border rounded-3xl p-5 flex gap-8 items-center hover:shadow-xl transition-all group border-none bg-secondary/10">
                        <div className="relative w-20 h-28 rounded-2xl overflow-hidden flex-shrink-0 shadow-lg group-hover:scale-105 transition-transform">
                          <Image src={entry.coverImageUrl} alt={entry.title} fill className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0 space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                             <h3 className="font-black text-2xl truncate group-hover:text-primary transition-colors">{entry.title}</h3>
                             <Badge className={`w-fit font-bold rounded-full ${
                               entry.status === 'Completed' ? 'bg-green-500' : 'bg-primary'
                             }`}>
                               {entry.status}
                             </Badge>
                          </div>
                          <div className="flex items-center gap-6 text-sm text-muted-foreground font-bold">
                            <span className="flex items-center gap-1.5">
                              <Star className="w-4 h-4 fill-primary text-primary" />
                              MAL Score: {entry.score}
                            </span>
                            <span className="opacity-60">Updated {new Date(entry.updatedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-secondary/5 rounded-3xl border-2 border-dashed border-primary/10">
                   <BookOpen className="w-16 h-16 text-primary/20 mx-auto mb-6" />
                   <h3 className="text-2xl font-black">Your list is empty</h3>
                   <p className="text-muted-foreground font-bold mb-8">Start exploring and tracking your favorites!</p>
                   <Button size="lg" className="rounded-full font-bold px-10" asChild>
                     <Link href="/browse">Browse Manhwa</Link>
                   </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="reading">
              <div className="grid gap-6">
                {entries?.filter(e => e.status === 'Currently Reading').map((entry) => (
                   <Link key={entry.id} href={`/manhwa/${entry.manhwaId}`}>
                    <div className="bg-card border rounded-3xl p-5 flex gap-8 items-center hover:shadow-xl transition-all border-none bg-secondary/10">
                       <div className="relative w-16 h-24 rounded-2xl overflow-hidden shadow-md">
                        <Image src={entry.coverImageUrl} alt={entry.title} fill className="object-cover" />
                       </div>
                       <h3 className="font-black text-xl flex-1">{entry.title}</h3>
                    </div>
                   </Link>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </section>
      </main>
    </div>
  );
}
