import { GoogleGenAI } from '@google/genai';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GeminiService {
    private static readonly MAX_CHUNK_CHARACTERS = 12_000;
    private static readonly MAX_REDUCTION_PASSES = 5;

    private readonly ai: GoogleGenAI;
    private readonly model: string;

    constructor(private readonly configService: ConfigService) {
        const apiKey = this.configService.getOrThrow<string>('GEMINI_API_KEY');

        this.ai = new GoogleGenAI({ apiKey });
        this.model = this.configService.get<string>('GEMINI_MODEL')
            ?? 'gemini-3.5-flash-lite';
    }

    async summarizeText(text: string): Promise<string> {
        let textToSummarize = text.trim();

        if (!textToSummarize) {
            throw new Error('Cannot summarize empty text');
        }

        for (let pass = 0; textToSummarize.length > GeminiService.MAX_CHUNK_CHARACTERS; pass++) {
            if (pass >= GeminiService.MAX_REDUCTION_PASSES) {
                throw new Error('Document is too large to summarize after multiple reduction passes');
            }

            const chunks = this.splitIntoChunks(textToSummarize);
            const chunkSummaries: string[] = [];

            // Process sequentially to avoid quickly exhausting free-tier rate limits.
            for (const chunk of chunks) {
                chunkSummaries.push(await this.generateSummary(chunk, true));
            }

            textToSummarize = chunkSummaries.join('\n\n');
        }

        return this.generateSummary(textToSummarize, false);
    }

    private async generateSummary(text: string, isChunk: boolean): Promise<string> {
        const instruction = isChunk
            ? 'Summarize this section of a larger document. Preserve facts, names, numbers, and conclusions that matter for a final overall summary.'
            : 'Summarize the following document clearly. Include the main ideas and important conclusions. Do not invent information not present in the document.';

        const response = await this.ai.models.generateContent({
            model: this.model,
            contents: `
${instruction}

Document:
---BEGIN DOCUMENT---
${text}
---END DOCUMENT---
      `.trim(),
        });


        if (!response.text) {
            throw new Error('Gemini returned an empty summary');
        }

        return response.text;
    }

    private splitIntoChunks(text: string): string[] {
        const chunks: string[] = [];
        let currentChunk = '';

        for (const paragraph of text.split(/\n\s*\n/)) {
            const trimmedParagraph = paragraph.trim();

            if (!trimmedParagraph) {
                continue;
            }

            if (trimmedParagraph.length > GeminiService.MAX_CHUNK_CHARACTERS) {
                if (currentChunk) {
                    chunks.push(currentChunk);
                    currentChunk = '';
                }

                for (let index = 0; index < trimmedParagraph.length; index += GeminiService.MAX_CHUNK_CHARACTERS) {
                    chunks.push(trimmedParagraph.slice(index, index + GeminiService.MAX_CHUNK_CHARACTERS));
                }
                continue;
            }

            const nextChunk = currentChunk
                ? `${currentChunk}\n\n${trimmedParagraph}`
                : trimmedParagraph;

            if (nextChunk.length > GeminiService.MAX_CHUNK_CHARACTERS) {
                chunks.push(currentChunk);
                currentChunk = trimmedParagraph;
            } else {
                currentChunk = nextChunk;
            }
        }

        if (currentChunk) {
            chunks.push(currentChunk);
        }

        return chunks;
    }
}
