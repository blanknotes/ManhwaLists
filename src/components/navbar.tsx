"use client";

import Link from "next/link";
import { Search, Bookmark, Sparkles, LogOut, LogIn, Trophy, LayoutGrid, Star, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUser, useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { searchManhwa, type MALManhwa } from "@/lib/mal-api";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Navbar() {
  const { user } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const [navSearchQuery, setNavSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<MALManhwa[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (navSearchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      const results = await searchManhwa(navSearchQuery);
      setSuggestions(results.slice(0, 5));
    }, 300);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [navSearchQuery]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (navSearchQuery.trim()) {
      router.push(`/browse?q=${encodeURIComponent(navSearchQuery.trim())}`);
      setNavSearchQuery("");
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (title: string) => {
    setNavSearchQuery("");
    setShowSuggestions(false);
    router.push(`/browse?q=${encodeURIComponent(title)}`);
  };

  return (
    <header className="sticky top-0 z-[100] w-full border-b bg-white/90 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-2xl font-black text-primary tracking-tighter">
            Manhwa<span className="text-foreground">List</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/ranking" className="text-sm font-black flex items-center gap-1.5 hover:text-primary transition-colors">
              <Trophy className="w-4 h-4" />
              Ranking
            </Link>
            <Link href="/genres" className="text-sm font-black flex items-center gap-1.5 hover:text-primary transition-colors">
              <LayoutGrid className="w-4 h-4" />
              Genres
            </Link>
            <Link href="/recommendations" className="text-sm font-black flex items-center gap-1.5 hover:text-primary transition-colors">
              <Sparkles className="w-4 h-4" />
              AI Recs
            </Link>
            <Link href="/forums" className="text-sm font-black flex items-center gap-1.5 hover:text-primary transition-colors">
              <MessageSquare className="w-4 h-4" />
              Forums
            </Link>
          </nav>
        </div>

        <div className="flex-1 max-w-md mx-8 hidden sm:block relative" ref={searchRef}>
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Instant search..." 
              className="pl-9 bg-secondary/40 border-none focus-visible:ring-2 focus-visible:ring-primary h-10 rounded-full font-bold"
              value={navSearchQuery}
              onFocus={() => setShowSuggestions(true)}
              onChange={(e) => {
                setNavSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
            />
          </form>

          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-primary/10 z-[110] overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
              <ScrollArea className="max-h-80">
                <div className="p-2">
                  <div className="px-3 py-1.5 text-[10px] uppercase font-black tracking-widest text-muted-foreground opacity-50">Quick Results</div>
                  {suggestions.map((s) => (
                    <button
                      key={s.mal_id}
                      onClick={() => handleSuggestionClick(s.title)}
                      className="w-full p-2 text-left hover:bg-primary/5 rounded-xl flex items-center gap-3 transition-colors group"
                    >
                      <div className="w-8 h-12 bg-secondary rounded-lg overflow-hidden flex-shrink-0 relative shadow-sm">
                        <img src={s.images?.webp?.image_url} alt="" className="object-cover w-full h-full" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-black block truncate text-sm group-hover:text-primary">{s.title}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-muted-foreground font-bold">{s.genres?.[0]?.name || "Action"}</span>
                          <span className="text-[10px] font-black text-primary flex items-center gap-0.5">
                            <Star className="w-2.5 h-2.5 fill-primary" />
                            {s.score || "N.A"}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-primary/5">
                <Link href="/profile">
                  <Bookmark className="w-5 h-5 text-primary" />
                </Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                    <Avatar className="h-10 w-10 border-2 border-primary/20">
                      <AvatarImage src={`https://picsum.photos/seed/${user.uid}/200`} alt={user.email || ""} />
                      <AvatarFallback className="font-black bg-primary text-primary-foreground">
                        {user.email?.[0].toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 rounded-2xl p-2" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal p-2">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-black leading-none">{user.email?.split('@')[0]}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="rounded-xl cursor-pointer font-black p-3 hover:bg-primary/5">
                    <Link href="/profile">My Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-xl cursor-pointer font-black p-3 hover:bg-primary/5">
                    <Link href="/recommendations">AI Recommendations</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="rounded-xl cursor-pointer font-black p-3 text-destructive focus:text-destructive hover:bg-destructive/5">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button className="rounded-full font-black px-6 shadow-lg shadow-primary/20 h-10" asChild>
              <Link href="/login">
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}