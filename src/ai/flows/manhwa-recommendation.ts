// This file is machine-generated - edit at your own risk!

'use server';

/**
 * @fileOverview Recommends Manhwa titles to the user based on their reading history and preferences.
 *
 * - recommendManhwa - A function that handles the Manhwa recommendation process.
 * - RecommendManhwaInput - The input type for the recommendManhwa function.
 * - RecommendManhwaOutput - The return type for the recommendManhwa function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendManhwaInputSchema = z.object({
  readManhwaTitles: z
    .array(z.string())
    .describe(
      'An array of manhwa titles that the user has read and liked previously.'
    ),
  preferredGenres: z
    .array(z.string())
    .optional()
    .describe('A list of genres the user is currently interested in.'),
  numberOfRecommendations: z
    .number()
    .default(4)
    .describe('The number of manhwa recommendations to return.'),
});
export type RecommendManhwaInput = z.infer<typeof RecommendManhwaInputSchema>;

const RecommendManhwaOutputSchema = z.object({
  recommendations: z
    .array(z.object({
      title: z.string().describe('The title of the recommended manhwa.'),
      reason: z.string().describe('A very short reason why this title matches the user preferences.')
    }))
    .describe('An array of recommended manhwa titles with reasons.'),
});
export type RecommendManhwaOutput = z.infer<typeof RecommendManhwaOutputSchema>;

export async function recommendManhwa(
  input: RecommendManhwaInput
): Promise<RecommendManhwaOutput> {
  return recommendManhwaFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendManhwaPrompt',
  input: {schema: RecommendManhwaInputSchema},
  output: {schema: RecommendManhwaOutputSchema},
  prompt: `You are an elite manhwa recommendation engine specializing in clean, high-quality Korean Manhwa. 
  
  The user enjoys these titles:
  {{#each readManhwaTitles}}- {{{this}}}
  {{/each}}

  {{#if preferredGenres}}
  The user also has a strong preference for these genres:
  {{#each preferredGenres}}- {{{this}}}
  {{/each}}
  {{/if}}

  Your task:
  1. Analyze the genres, art styles, and themes of the provided titles and preferred genres.
  2. Recommend {{numberOfRecommendations}} distinct MANHWA titles (must be Korean Webtoons/Manhwa) that are NOT in the input list.
  3. Ensure the recommendations are popular and highly-rated titles available on MyAnimeList.
  4. Provide a punchy, 1-sentence reason for each recommendation.
  
  STRICT CONTENT RULES:
  - DO NOT recommend "Boys Love", "Girls Love", "Yaoi", or "Yuri" content.
  - DO NOT recommend "Adult", "Hentai", "Erotica", or any explicit/NSFW content.
  - DO NOT recommend Japanese Manga or Chinese Manhua. Only Korean Manhwa/Webtoons are allowed.
  `,
});

const recommendManhwaFlow = ai.defineFlow(
  {
    name: 'recommendManhwaFlow',
    inputSchema: RecommendManhwaInputSchema,
    outputSchema: RecommendManhwaOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
