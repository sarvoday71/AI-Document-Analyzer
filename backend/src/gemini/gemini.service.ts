import { GoogleGenAI } from '@google/genai';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GeminiService {
    private readonly ai: GoogleGenAI;
    private readonly model: string;

    constructor(private readonly configService: ConfigService) {
        const apiKey = this.configService.getOrThrow<string>('GEMINI_API_KEY');

        this.ai = new GoogleGenAI({ apiKey });
        this.model = this.configService.getOrThrow<string>(
            'GEMINI_MODEL',
            'gemini-3.5-flash-lite'
        )
    }

    async summarizeText(text: string) {
        const response = await this.ai.models.generateContent({
            model: this.model,
            contents: `
Summarize the following document clearly.

Requirements:
- Write a concise summary.
- Include the main ideas and important conclusions.
- Do not invent information not present in the document.

Document:
---BEGIN DOCUMENT---
${text}
---END DOCUMENT---
      `.trim(),
        });


        if (!response.text) {
            throw new Error('Gemini returned an empty summary');
        }

        console.log("Summarized document is as follows", response.text)

        return response.text;

    }
}
