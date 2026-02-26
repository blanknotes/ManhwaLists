"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { MessageSquare, ThumbsUp, MessageCircle, Clock, User, Plus, Loader2, Send, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { useMemoFirebase } from "@/firebase/provider";
import { collection, query, orderBy } from "firebase/firestore";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function ForumsPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newThread, setNewThread] = useState({ title: "", content: "", category: "General" });

  const threadsQuery = useMemoFirebase(() => {
    return query(collection(db, "forumThreads"), orderBy("createdAt", "desc"));
  }, [db]);

  const { data: threads, isLoading } = useCollection(threadsQuery);

  const handleCreateThread = () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Login Required",
        description: "Please sign in to start a new discussion.",
      });
      return;
    }

    if (!newThread.title.trim() || !newThread.content.trim()) {
      toast({
        variant: "destructive",
        title: "Missing Info",
        description: "Title and content are required.",
      });
      return;
    }

    const threadData = {
      title: newThread.title,
      content: newThread.content,
      userId: user.uid,
      authorName: user.email?.split('@')[0] || "Anonymous",
      category: newThread.category,
      createdAt: new Date().toISOString(),
      replyCount: 0,
      likes: 0
    };

    addDocumentNonBlocking(collection(db, "forumThreads"), threadData);

    toast({
      title: "Success!",
      description: "Your thread has been posted.",
    });

    setNewThread({ title: "", content: "", category: "General" });
    setIsDialogOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="space-y-2">
            <h1 className="text-5xl font-black tracking-tighter">Community Forums</h1>
            <p className="text-muted-foreground font-bold text-lg">Discuss theories, latest chapters, and share reviews.</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full px-10 font-black h-14 text-lg shadow-xl shadow-primary/20 transition-all hover:scale-105">
                <Plus className="w-6 h-6 mr-2" />
                Start Discussion
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[2.5rem] sm:max-w-[550px] p-8 border-none shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-3xl font-black tracking-tight">New Discussion</DialogTitle>
                <DialogDescription className="font-bold text-muted-foreground">
                  Share your thoughts with the community.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="font-black text-xs uppercase tracking-[0.2em] text-primary">Topic Title</Label>
                  <Input 
                    id="title" 
                    placeholder="e.g., Thoughts on the latest Solo Leveling chapter?" 
                    className="rounded-2xl h-12 bg-secondary/30 border-none font-bold"
                    value={newThread.title}
                    onChange={(e) => setNewThread({...newThread, title: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category" className="font-black text-xs uppercase tracking-[0.2em] text-primary">Category</Label>
                  <select 
                    id="category"
                    className="w-full rounded-2xl h-12 bg-secondary/30 border-none font-bold px-4 appearance-none focus:ring-2 focus:ring-primary outline-none"
                    value={newThread.category}
                    onChange={(e) => setNewThread({...newThread, category: e.target.value})}
                  >
                    <option value="General">General</option>
                    <option value="Releases">Latest Releases</option>
                    <option value="Recs">Recommendations</option>
                    <option value="Theories">Theories</option>
                    <option value="Reviews">Reviews</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content" className="font-black text-xs uppercase tracking-[0.2em] text-primary">Message</Label>
                  <Textarea 
                    id="content" 
                    placeholder="What's on your mind?" 
                    className="rounded-2xl min-h-[150px] bg-secondary/30 border-none font-medium text-lg p-4"
                    value={newThread.content}
                    onChange={(e) => setNewThread({...newThread, content: e.target.value})}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateThread} className="w-full h-14 rounded-2xl font-black text-lg shadow-lg">
                  <Send className="w-5 h-5 mr-2" />
                  Post Discussion
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </header>

        <div className="grid lg:grid-cols-[280px_1fr] gap-12">
          <aside className="space-y-8 hidden lg:block">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-primary/5 space-y-6">
              <h3 className="font-black text-[10px] uppercase tracking-[0.3em] text-muted-foreground opacity-60">Explore Topics</h3>
              <nav className="flex flex-col gap-2">
                {["All Discussions", "General", "Latest Releases", "Recommendations", "Theories", "Reviews"].map(cat => (
                  <button key={cat} className="text-left py-3 px-4 rounded-2xl hover:bg-primary/5 hover:text-primary transition-all text-sm font-black flex items-center justify-between group">
                    {cat}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          <section className="space-y-6">
            {isLoading ? (
              <div className="flex flex-col gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-40 bg-secondary/20 rounded-[2.5rem] animate-pulse" />
                ))}
              </div>
            ) : threads && threads.length > 0 ? (
              threads.map((thread) => (
                <div key={thread.id} className="bg-white border-2 border-transparent rounded-[2.5rem] p-8 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all group cursor-pointer shadow-sm">
                  <div className="flex flex-col gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-[10px] uppercase font-black tracking-widest text-primary border-primary/20 bg-primary/5 px-3 py-1">
                          {thread.category || "General"}
                        </Badge>
                        <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(thread.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <h2 className="text-2xl font-black group-hover:text-primary transition-colors tracking-tight leading-tight">
                        {thread.title}
                      </h2>
                      <p className="text-muted-foreground font-medium line-clamp-2 italic opacity-80">
                        "{thread.content}"
                      </p>
                    </div>
                    <div className="flex items-center justify-between border-t pt-6 border-secondary/50">
                      <div className="flex items-center gap-6 text-sm text-muted-foreground font-bold">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-primary" />
                          </div>
                          {thread.authorName || "Anonymous"}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MessageCircle className="w-4 h-4" />
                          {thread.replyCount || 0}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <ThumbsUp className="w-4 h-4" />
                          {thread.likes || 0}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="font-black text-primary rounded-full hover:bg-primary/5 px-4">
                        View Thread
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-32 bg-secondary/10 rounded-[3rem] border-4 border-dashed border-primary/10">
                 <Globe className="w-16 h-16 text-primary/20 mx-auto mb-6" />
                 <h2 className="text-3xl font-black mb-2">Community is quiet...</h2>
                 <p className="text-muted-foreground font-bold text-lg mb-8">Be the first to break the silence!</p>
                 <Button onClick={() => setIsDialogOpen(true)} className="rounded-full px-10 font-black h-14 shadow-lg shadow-primary/20">Create First Thread</Button>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}