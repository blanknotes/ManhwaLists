'use server';

/**
 * @fileOverview Generates a reading list of manhwa titles based on a user-provided prompt.
 *
 * - generateReadingList - A function that generates a reading list based on the input prompt.
 * - GenerateReadingListInput - The input type for the generateReadingList function.
 * - GenerateReadingListOutput - The return type for the generateReadingList function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateReadingListInputSchema = z.string().describe('A prompt describing the desired reading list, including genre and themes.');
export type GenerateReadingListInput = z.infer<typeof GenerateReadingListInputSchema>;

const GenerateReadingListOutputSchema = z.object({
  readingList: z.array(z.string()).describe('A list of manhwa titles that fit the given prompt.'),
});
export type GenerateReadingListOutput = z.infer<typeof GenerateReadingListOutputSchema>;

export async function generateReadingList(input: GenerateReadingListInput): Promise<GenerateReadingListOutput> {
  return generateReadingListFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateReadingListPrompt',
  input: {schema: GenerateReadingListInputSchema},
  output: {schema: GenerateReadingListOutputSchema},
  prompt: `You are a manhwa recommendation expert. Generate a list of manhwa titles based on the following prompt:\n\nPrompt: {{{$input}}}\n\nList:`,
});

const generateReadingListFlow = ai.defineFlow(
  {
    name: 'generateReadingListFlow',
    inputSchema: GenerateReadingListInputSchema,
    outputSchema: GenerateReadingListOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
