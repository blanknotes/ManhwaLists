
"use client";

import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type Manhwa } from "@/app/lib/db";
import { type MALManhwa } from "@/lib/mal-api";

interface ManhwaCardProps {
  manhwa?: Manhwa;
  malManhwa?: MALManhwa;
  showRank?: boolean;
}

export function ManhwaCard({ manhwa, malManhwa, showRank = false }: ManhwaCardProps) {
  const displayData = malManhwa ? {
    id: malManhwa.mal_id.toString(),
    title: malManhwa.title,
    image: malManhwa.images.webp.image_url,
    rating: malManhwa.score || 0,
    rank: malManhwa.rank,
    genre: malManhwa.genres?.[0]?.name || "Action",
    status: malManhwa.status
  } : {
    id: manhwa?.id || "",
    title: manhwa?.title || "",
    image: manhwa?.image || "",
    rating: manhwa?.rating || 0,
    rank: 0,
    genre: manhwa?.genres?.[0] || "",
    status: manhwa?.status || ""
  };

  return (
    <Link href={`/manhwa/${displayData.id}`}>
      <Card className="overflow-hidden h-full group hover:shadow-xl transition-all duration-300 border-none bg-secondary/20 relative">
        <div className="relative aspect-[2/3]">
          <Image
            src={displayData.image}
            alt={displayData.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 50vw, 200px"
          />
          
          {/* Rank Overlay - Only visible if showRank is true */}
          {showRank && displayData.rank > 0 && (
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
              <div className="absolute top-3 left-3 z-10">
                <div className="bg-primary text-white font-black text-xl md:text-2xl px-3 py-1 rounded-br-2xl rounded-tl-sm shadow-2xl flex items-center gap-1 border-b-2 border-r-2 border-white/20">
                  <span className="text-xs opacity-70">#</span>
                  {displayData.rank}
                </div>
              </div>
              
              {/* Decorative Rank Watermark on Hover */}
              <div className="absolute bottom-10 right-2 opacity-0 group-hover:opacity-10 transition-opacity duration-500">
                <span className="text-8xl font-black italic">{displayData.rank}</span>
              </div>
            </div>
          )}

          <div className="absolute bottom-2 left-2">
            <Badge variant="secondary" className="bg-black/60 text-white backdrop-blur-md border-none flex items-center gap-1 font-bold">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              {displayData.rating}
            </Badge>
          </div>
        </div>
        <CardContent className="p-3">
          <h3 className="font-bold text-sm line-clamp-1 group-hover:text-primary transition-colors">
            {displayData.title}
          </h3>
          <div className="flex items-center justify-between mt-1">
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
              {displayData.genre}
            </p>
            <Badge variant="outline" className="text-[8px] h-4 px-1.5 border-primary/20 text-primary font-black">
              {displayData.status === 'Finished' ? 'END' : 'ON'}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
