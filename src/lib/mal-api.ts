/**
 * @fileOverview Service to fetch data from MyAnimeList via Jikan API with content filtering.
 */

export interface MALManhwa {
  mal_id: number;
  title: string;
  synopsis: string;
  images: {
    webp: {
      image_url: string;
    };
  };
  score: number;
  rank: number;
  chapters: number;
  status: string;
  authors: { name: string }[];
  genres: { name: string }[];
}

const EXCLUDED_GENRES = [
  'boys love', 
  'girls love', 
  'yaoi', 
  'yuri', 
  'hentai', 
  'erotica', 
  'ecchi', 
  'smut',
  'explicit genres'
];

/**
 * Filters manhwa to remove unwanted genres (Adult/BL/GL).
 */
function filterManhwa(data: MALManhwa[]): MALManhwa[] {
  if (!data) return [];
  return data.filter(m => {
    const genres = m.genres?.map(g => g.name.toLowerCase()) || [];
    return !genres.some(genre => EXCLUDED_GENRES.includes(genre));
  });
}

export async function getTopManhwa(page: number = 1): Promise<MALManhwa[]> {
  try {
    const response = await fetch(`https://api.jikan.moe/v4/top/manga?type=manhwa&page=${page}`);
    if (!response.ok) throw new Error('Failed to fetch data from MAL');
    const json = await response.json();
    return filterManhwa(json.data);
  } catch (error) {
    console.error('Error fetching MAL data:', error);
    return [];
  }
}

/**
 * Fetches many top manhwa by iterating through API pages.
 */
export async function getManyTopManhwa(targetCount: number = 200): Promise<MALManhwa[]> {
  const allManhwa: MALManhwa[] = [];
  let currentPage = 1;
  
  while (allManhwa.length < targetCount) {
    if (currentPage > 1) await new Promise(resolve => setTimeout(resolve, 500));
    
    const pageData = await getTopManhwa(currentPage);
    if (pageData.length === 0) break;
    
    allManhwa.push(...pageData);
    currentPage++;

    if (currentPage > 10) break; // Limit to 10 pages for performance
  }

  return allManhwa.slice(0, targetCount);
}

export async function getManhwaById(id: string): Promise<MALManhwa | null> {
  try {
    const response = await fetch(`https://api.jikan.moe/v4/manga/${id}`);
    if (!response.ok) throw new Error('Manhwa not found');
    const json = await response.json();
    const manhwa = json.data;
    
    const genres = manhwa.genres?.map((g: any) => g.name.toLowerCase()) || [];
    if (genres.some((genre: string) => EXCLUDED_GENRES.includes(genre))) {
      return null;
    }

    if (manhwa.type && manhwa.type.toLowerCase() !== 'manhwa') {
      return null;
    }
    
    return manhwa;
  } catch (error) {
    console.error('Error fetching MAL details:', error);
    return null;
  }
}

export async function searchManhwa(query: string): Promise<MALManhwa[]> {
  if (!query) return [];
  try {
    const response = await fetch(`https://api.jikan.moe/v4/manga?q=${encodeURIComponent(query)}&type=manhwa`);
    if (!response.ok) throw new Error('Failed to search manhwa');
    const json = await response.json();
    return filterManhwa(json.data);
  } catch (error) {
    console.error('Error searching MAL:', error);
    return [];
  }
}
