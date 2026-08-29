import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { IDocumentQueuePayload } from "./document-queue.types";
import { PrismaService } from "src/prisma.service";
import { extname } from "node:path";
import { readFile } from "node:fs/promises";
import { PDFParse } from 'pdf-parse';
import mammoth from "mammoth";
import { GeminiService } from "src/gemini/gemini.service";

@Processor('document-processing')
export class DocumentProcessor extends WorkerHost {
    constructor(
        private readonly prisma: PrismaService,
        private readonly gemini: GeminiService
    ) {
        super();
    }

    // Extracting text from the document
    async textExratction(fileUrl: string) {
        const extension = extname(fileUrl).toLowerCase();

        if (extension === '.txt') {
            return readFile(fileUrl, 'utf8');
        }

        if (extension === '.pdf') {
            const fileBuffer = await readFile(fileUrl);
            const parser = new PDFParse({ data: fileBuffer });

            try {
                const result = await parser.getText();
                return result.text;
            } finally {
                await parser.destroy();
            }
        }

        if (extension === '.docx') {
            const result = await mammoth.extractRawText({ path: fileUrl });

            return result.value;
        }

        throw new Error(`unsuported file type : ${extension}`);
    }



    // Below is the process which picks up the jobs from queue and processes it one by one
    async process(job: Job<IDocumentQueuePayload>) {
        const jobToBeProcessed = job.data;
        console.log("Job picked to excecute");
        try {

            const document = await this.prisma.document.findUnique({
                where: {
                    id: jobToBeProcessed.documentId
                }
            })

            if (!document) {
                throw new Error("Document with provided id does not exist")
            }

            await this.prisma.document.update({
                where: {
                    id: jobToBeProcessed.documentId
                },
                data: {
                    status: 'PROCESSING'
                }
            })

            // Now here perform the text extraction part from the pdf and store it inside the database
            const fileUrl = document?.fileUrl
            const rawText = await this.textExratction(fileUrl)

            // Here we are summarizing the raw text
            const summarizedText = rawText ? await this.gemini.summarizeText(rawText) : null;

            const completDBwithSummary = await this.prisma.document.update({
                where: {
                    id: jobToBeProcessed.documentId
                },
                data: {
                    summary: summarizedText,
                    status: "COMPLETED",
                    rawText
                }
            })
            console.log(completDBwithSummary);
            console.log("Summary generation completed")


        } catch (error) {
            if (job.attemptsMade + 1 >= (job.opts.attempts ?? 1)) {
                await this.prisma.document.update({
                    where: { id: jobToBeProcessed.documentId },
                    data: {
                        status: 'FAILED',
                        errorMessage:
                            error instanceof Error ? error.message : 'Document processing failed',
                    },
                });
            }
            throw error;
        }


    }
}
